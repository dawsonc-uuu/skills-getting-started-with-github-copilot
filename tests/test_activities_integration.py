from urllib.parse import quote


def test_get_activities(client):
    r = client.get("/activities")
    assert r.status_code == 200
    data = r.json()
    assert "Chess Club" in data


def test_api_signup_flow(client):
    email = "int_new@mergington.edu"
    activity = "Chess Club"
    url = f"/activities/{quote(activity)}/signup?email={quote(email)}"
    r = client.post(url)
    assert r.status_code == 200
    data = client.get("/activities").json()
    assert email in data[activity]["participants"]


def test_api_signup_duplicate(client):
    email = "int_dup@mergington.edu"
    activity = "Chess Club"
    url = f"/activities/{quote(activity)}/signup?email={quote(email)}"
    r1 = client.post(url)
    assert r1.status_code == 200
    r2 = client.post(url)
    assert r2.status_code == 400


def test_api_remove_flow(client):
    email = "int_remove@mergington.edu"
    activity = "Chess Club"
    # ensure present
    client.post(f"/activities/{quote(activity)}/signup?email={quote(email)}")
    r = client.delete(f"/activities/{quote(activity)}/participants?email={quote(email)}")
    assert r.status_code == 200
    data = client.get("/activities").json()
    assert email not in data[activity]["participants"]


def test_api_remove_nonexistent_participant(client):
    r = client.delete("/activities/Chess%20Club/participants?email=nope@mergington.edu")
    assert r.status_code == 404
