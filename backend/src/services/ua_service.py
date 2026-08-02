from user_agents import parse

def parse_user_agent(ua_string: str | None) -> dict:
    if not ua_string:
        return {
            "browser": None,
            "browser_version": None,
            "os": None,
            "os_version": None,
            "device_type": None,
        }

    ua = parse(ua_string)

    if ua.is_bot:
        device_type = "bot"
    elif ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    else:
        device_type = "desktop"

    return {
        "browser": ua.browser.family,
        "browser_version": ua.browser.version_string,
        "os": ua.os.family,
        "os_version": ua.os.version_string,
        "device_type": device_type,
    }