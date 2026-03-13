"""conftest.py — pytest configuration.
Adds the backend root to sys.path so `from app.x import y` works in all tests.
"""
import sys
import os

# Add the backend root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
