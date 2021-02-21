import json
import os 

from flask import current_app
from flask_login import UserMixin

from typing import Optional


class User(UserMixin):
  pass


def get(user_id: str) -> Optional[User]:
  if user_id not in get_users():
    return None
  user = User()
  user.id = user_id
  return user


def get_users():
  root = current_app.config['DB_FOLDER']
  with open(os.path.join(root, 'users.db'), 'r') as f:
    return json.loads(f.read())
