def test_register_login_me(client):
    payload = {"username":"trail_user","email":"trail@example.com","password":"StrongPass123"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    token = response.json()["access_token"]
    assert "hashed_password" not in response.json()["user"]
    assert client.get("/api/auth/me", headers={"Authorization":f"Bearer {token}"}).status_code == 200
    login = client.post("/api/auth/login", json={"email":payload["email"],"password":payload["password"]})
    assert login.status_code == 200

def test_duplicate_email(client):
    payload = {"username":"trail_user","email":"trail@example.com","password":"StrongPass123"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    payload["username"] = "another_user"
    assert client.post("/api/auth/register", json=payload).status_code == 409

def test_protected_endpoint(client):
    assert client.get("/api/auth/me").status_code == 401
