import json
import os 

from flask import current_app
from flask_login import UserMixin

from typing import Optional

from dotenv import load_dotenv

load_dotenv()

ADMIN_USER = os.environ.get('ADMIN_USER')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')


class User(UserMixin):
  pass


def get(user_id: str) -> Optional[User]:
  if user_id not in get_users():
    return None
  user = User()
  user.id = user_id
  return user


def get_users():
  # TODO: Eventually read this with a file on cloud storage
  return {ADMIN_USER: {'pw': ADMIN_PASSWORD}}
