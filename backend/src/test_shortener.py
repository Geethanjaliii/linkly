import json
import uuid
import urllib.request
import urllib.error
import urllib.parse

BASE_URL = "http://localhost:8000"

def make_form_request(path, data=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/x-www-form-urlencoded"}
    req_data = None
    if data is not None:
        req_data = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            resp_body = response.read().decode("utf-8")
            return status, json.loads(resp_body)
    except urllib.error.HTTPError as e:
        status = e.code
        resp_body = e.read().decode("utf-8")
        try:
            return status, json.loads(resp_body)
        except:
            return status, resp_body

def make_request(path, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
        
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            resp_body = response.read().decode("utf-8")
            resp_headers = dict(response.info())
            
            # Parse json body if present
            try:
                body_json = json.loads(resp_body)
            except json.JSONDecodeError:
                body_json = resp_body
                
            return status, body_json, resp_headers
    except urllib.error.HTTPError as e:
        status = e.code
        resp_body = e.read().decode("utf-8")
        try:
            body_json = json.loads(resp_body)
        except json.JSONDecodeError:
            body_json = resp_body
        return status, body_json, {}

def test_url_shortening_workflow():
    print("Starting Phase 2 verification test (via urllib)...")
    
    # 1. Generate unique emails for testing
    user_a_email = f"user_a_{uuid.uuid4().hex[:6]}@example.com"
    user_b_email = f"user_b_{uuid.uuid4().hex[:6]}@example.com"
    password = "securepassword123"

    # Register User A
    status, body, _ = make_request("/signup", "POST", {"name": "User A", "email": user_a_email, "password": password})
    assert status == 201, f"Signup User A failed: {body}"

    # Log in User A
    status, body = make_form_request("/login", {"username": user_a_email, "password": password})
    assert status == 200, f"Login User A failed: {body}"
    token_a = body["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    status, body, _ = make_request("/signup", "POST", {"name": "User B", "email": user_b_email, "password": password})
    assert status == 201, f"Signup User B failed: {body}"
    
    # Log in User B
    status, body = make_form_request("/login", {"username": user_b_email, "password": password})
    assert status == 200, f"Login User B failed: {body}"
    token_b = body["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}


    # 2. Test URL validation: Shorten invalid URL (should return 422 validation error)
    status, body, _ = make_request("/shorten", "POST", {"original_url": "garbage-text-not-url"}, headers_a)
    assert status == 422, f"Expected 422 for invalid URL structure, got {status}: {body}"
    
    status, body, _ = make_request("/shorten", "POST", {"original_url": "http://"}, headers_a)
    assert status == 422, f"Expected 422 for incomplete URL, got {status}: {body}"

    # 3. Shorten valid URL
    target_url = "https://www.wikipedia.org/"
    status, body, _ = make_request("/shorten", "POST", {"original_url": target_url}, headers_a)
    assert status == 201, f"Shorten failed: {body}"
    url_data = body
    
    assert url_data["original_url"] == target_url
    assert "short_code" in url_data
    short_code = url_data["short_code"]
    
    # Check that code is 6 to 8 characters and alphanumeric only
    assert 6 <= len(short_code) <= 8
    assert short_code.isalnum()
    
    assert "short_url" in url_data
    assert url_data["click_count"] == 0

    # 4. Verify owner-level isolation (User B should see 0 URLs, User A should see 1 URL)
    # User B list
    status, body, _ = make_request("/urls", "GET", headers=headers_b)
    assert status == 200
    assert len(body) == 0, "User B should not see User A's URLs"

    # User A list
    status, body, _ = make_request("/urls", "GET", headers=headers_a)
    assert status == 200
    assert len(body) == 1, f"Expected 1 URL in list, got {body}"
    assert body[0]["short_code"] == short_code

    # 5. Test public redirection (urllib follows redirects automatically, which leads to wikipedia)
    # We inspect the final response from opening the redirection endpoint
    # To check redirection, we block automatic redirect handling to verify location header
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            # Raise an exception with redirection details to catch the Location header
            raise urllib.error.HTTPError(req.full_url, code, msg, headers, fp)

    opener = urllib.request.build_opener(NoRedirectHandler)
    try:
        opener.open(f"{BASE_URL}/{short_code}")
        assert False, "Redirection did not trigger HTTP Redirect status code"
    except urllib.error.HTTPError as e:
        assert e.code == 307 or e.code == 302
        assert e.headers.get("location") == target_url

    # 6. Verify click count increment
    status, body, _ = make_request("/urls", "GET", headers=headers_a)
    assert status == 200
    assert body[0]["click_count"] == 1, f"Click count should have incremented to 1, got {body[0]['click_count']}"
    url_id = body[0]["id"]

    # 7. Verify GET /url/{id} (individual URL endpoint)
    # Correct owner fetch
    status, body, _ = make_request(f"/url/{url_id}", "GET", headers=headers_a)
    assert status == 200
    assert body["original_url"] == target_url
    assert body["short_code"] == short_code

    # Incorrect owner fetch (User B trying to fetch User A's link)
    status, body, _ = make_request(f"/url/{url_id}", "GET", headers=headers_b)
    assert status == 404, f"Expected 404 for unauthorized URL detail fetch, got {status}"

    # 8. Verify PUT /url/{id} (edit destination endpoint)
    new_target_url = "https://www.google.com/"
    # Incorrect owner edit
    status, body, _ = make_request(f"/url/{url_id}", "PUT", {"original_url": new_target_url}, headers=headers_b)
    assert status == 404, f"Expected 404 for unauthorized URL update, got {status}"

    # Correct owner edit
    status, body, _ = make_request(f"/url/{url_id}", "PUT", {"original_url": new_target_url}, headers=headers_a)
    assert status == 200
    assert body["original_url"] == new_target_url

    # 9. Verify DELETE /url/{id} (delete link endpoint)
    # Incorrect owner delete
    status, body, _ = make_request(f"/url/{url_id}", "DELETE", headers=headers_b)
    assert status == 404, f"Expected 404 for unauthorized URL delete, got {status}"

    # Correct owner delete
    status, body, headers = make_request(f"/url/{url_id}", "DELETE", headers=headers_a)
    assert status == 204, f"Expected 204 No Content for URL delete, got {status}: {body}"
    assert body == "", "Delete response should contain no JSON body"

    # Confirm it is removed from list
    status, body, _ = make_request("/urls", "GET", headers=headers_a)
    assert status == 200
    assert len(body) == 0, f"Expected URL list to be empty after deletion, got {body}"

    print("ALL Phase 3 URL CRUD backend tests passed successfully!")

if __name__ == "__main__":
    test_url_shortening_workflow()

