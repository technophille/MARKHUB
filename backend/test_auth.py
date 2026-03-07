import requests
import random
import string

BASE_URL = "http://127.0.0.1:8000"

def test_long_password():
    print("Testing long password (>72 bytes)...")
    
    # Generate a random username and a very long password (100+ chars)
    username = ''.join(random.choices(string.ascii_lowercase, k=10))
    long_password = "A" * 100 + "B" * 50  # 150 bytes
    
    # 1. Signup
    print(f"Signing up user '{username}'...")
    req = requests.post(f"{BASE_URL}/api/auth/signup", data={
        "username": username,
        "password": long_password
    })
    
    res = req.json()
    print("Signup response:", res)
    assert res.get("status") == "success", "Signup failed"
    
    # 2. Login
    print(f"Logging in user '{username}'...")
    req = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": username,
        "password": long_password
    })
    
    res = req.json()
    print("Login response:", res)
    assert res.get("status") == "success", "Login failed"
    print("All tests passed!")

if __name__ == "__main__":
    test_long_password()
