import pytest
from fastapi import HTTPException

from src import app as app_module


def test_signup_success():
    email = "unit_new@mergington.edu"
    activity = "Chess Club"
    # ensure clean state
    if email in app_module.activities[activity]["participants"]:
        app_module.activities[activity]["participants"].remove(email)

    resp = app_module.signup_for_activity(activity, email)
    assert "Signed up" in resp["message"]
    assert email in app_module.activities[activity]["participants"]


def test_signup_nonexistent_activity():
    with pytest.raises(HTTPException) as exc:
        app_module.signup_for_activity("No Such Club", "a@b.com")
    assert exc.value.status_code == 404


def test_signup_duplicate():
    email = "duplicate@mergington.edu"
    activity = "Chess Club"
    # ensure present
    if email not in app_module.activities[activity]["participants"]:
        app_module.activities[activity]["participants"].append(email)

    with pytest.raises(HTTPException) as exc:
        app_module.signup_for_activity(activity, email)
    assert exc.value.status_code == 400


def test_remove_success():
    email = "remove_me@mergington.edu"
    activity = "Chess Club"
    if email not in app_module.activities[activity]["participants"]:
        app_module.activities[activity]["participants"].append(email)

    resp = app_module.remove_participant(activity, email)
    assert "Removed" in resp["message"]
    assert email not in app_module.activities[activity]["participants"]


def test_remove_nonexistent_participant():
    with pytest.raises(HTTPException) as exc:
        app_module.remove_participant("Chess Club", "nope@mergington.edu")
    assert exc.value.status_code == 404
