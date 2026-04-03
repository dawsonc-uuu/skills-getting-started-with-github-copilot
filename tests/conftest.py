import copy
import pytest
from fastapi.testclient import TestClient

from src import app as app_module


@pytest.fixture
def client():
    """TestClient for the FastAPI app."""
    return TestClient(app_module.app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Deep-copy and restore `activities` around each test to avoid state bleed."""
    orig = copy.deepcopy(app_module.activities)
    yield
    app_module.activities.clear()
    app_module.activities.update(orig)
