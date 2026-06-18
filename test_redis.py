from redis import Redis
from dotenv import load_dotenv
import os

load_dotenv("backend/.env")

redis_client = Redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True,
    ssl=True
)

redis_client.set("linkly_test", "working")
print(redis_client.get("linkly_test"))