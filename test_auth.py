import requests

url = "http://localhost:8000/token"
data = {
    "username": "yash",
    "password": "tLiktbti07!"
}
headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

response = requests.post(url, data=data, headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")