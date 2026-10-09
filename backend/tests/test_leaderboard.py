def test_leaderboard_requires_region(client):
    assert client.get("/api/leaderboard/weekly?region_type=country&region=India").status_code == 200

def test_bad_region_type(client):
    assert client.get("/api/leaderboard/weekly?region_type=continent&region=Asia").status_code == 422
