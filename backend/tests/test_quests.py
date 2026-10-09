def test_quest_filter(client):
    response = client.get("/api/quests?time_slot=morning")
    assert response.status_code == 200
    assert response.json()
    assert all(q["time_slot"] == "morning" for q in response.json())

def test_invalid_slot(client):
    assert client.get("/api/quests?time_slot=afternoon").status_code == 422

def test_daily_quests(client):
    assert len(client.get("/api/quests/daily").json()) <= 5
