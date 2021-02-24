from __future__ import annotations

import os
from dotenv import load_dotenv
from google.cloud import storage
from flask import current_app
from typing import Optional
import werkzeug

_FileStorage = werkzeug.datastructures.FileStorage

load_dotenv()

GCS_BUCKET = os.environ.get('GCS_BUCKET')

UPLOAD_FOLDER = 'data/images'
DB_FOLDER = 'data/server_db'
GCS_ROOT = 'DenJonver/'

file_util: Optional[_FileUtil] = None


def _initialize_file_util():
  """Initializes a File Util to avoid passing root paths."""
  global file_util
  if file_util is not None:
    return
  file_util = _FileUtil(current_app.root_path, GCS_ROOT)  


def save_image(file: _FileStorage, image_key: str) -> None:
  _initialize_file_util()
  global file_util
  file_util.save_image(file, image_key)


def get_image_path(image_key: str) -> Optional[str]:
  _initialize_file_util()
  global file_util
  return file_util.get_image_path(image_key)


def save_to_file(contents: str, file_key: str) -> None:
  _initialize_file_util()
  global file_util
  file_util.save_to_file(contents, file_key)


def load_from_file(file_key: str) -> Optional[str]:
  _initialize_file_util()
  global file_util
  return file_util.load_from_file(file_key)


class _FileUtil:

  def __init__(self, local_root: str, gcs_root: str):
    self.local_root = local_root
    self.gcs_root = gcs_root
    self.new_files = {}

  def save_image(self, file: _FileStorage, image_key: str) -> None:
    """Saves the input image file with the given key."""
    dest = os.path.join(self.local_root, UPLOAD_FOLDER, image_key)
    gcs_dest = os.path.join(self.gcs_root, UPLOAD_FOLDER, image_key)
    file.save(dest)
    self.new_files[dest] = gcs_dest
    # TODO: Do this in the background once requests have stopped
    upload_blob(dest, gcs_dest)

  def get_image_path(self, image_key: str) -> Optional[str]:
    """Returns the path of the image with the given key."""
    dest = os.path.join(self.local_root, UPLOAD_FOLDER, image_key)
    if not os.path.isfile(dest):  
      gcs_dest = os.path.join(self.gcs_root, UPLOAD_FOLDER, image_key)
      if not download_blob(gcs_dest, dest):
        return None
    return dest

  def save_to_file(self, contents: str, file_key: str) -> None:
    """Saves the given contents to the input file key."""
    dest = os.path.join(self.local_root, DB_FOLDER, file_key)
    with open(dest, 'w') as f:
      print(f'Saving to disk at {file_key}')
      f.write(contents)
    gcs_dest = os.path.join(self.gcs_root, DB_FOLDER, file_key)
    self.new_files[dest] = gcs_dest
    # TODO: Do this in the background once requests have stopped
    upload_blob(dest, gcs_dest)

  def load_from_file(self, file_key: str) -> Optional[str]:
    """Returns the contents from the input file key."""
    dest = os.path.join(self.local_root, DB_FOLDER, file_key)
    if not os.path.isfile(dest):  
      gcs_dest = os.path.join(self.gcs_root, DB_FOLDER, file_key)
      if not download_blob(gcs_dest, dest):
        return None
    contents = None
    try:
      print(f'Retrieving {file_key} from disk at {dest}')
      with open(dest, 'r') as f:
        contents = f.read()
    except (FileNotFoundError) as e:
      print(f'Error loading file: {e}')
    print(f'Returning {contents}')
    return contents


def download_blob(remote_path: str, local_path: str) -> bool:
    """Downloads a blob from the bucket."""
    print(f'Attempting to download {remote_path} to {local_path}')
    storage_client = storage.Client()
    bucket = storage_client.bucket(GCS_BUCKET)
    blob = bucket.blob(remote_path)
    # TODO: Keep track of what we've already checked
    # also, if there's a way to check the entire dir contents
    if not blob.exists():
      print('Blob does not exist')
      return False
    try:
      blob.download_to_filename(local_path)
      return True
    except Exception as e:
      print(f'Failed to download blob {remote_path} to {local_path}')
      print(e)
      return False


def upload_blob(local_path: str, remote_path: str) -> bool:
    """Uploads a file to the bucket."""
    print(f'Attempting to upload {local_path} to {remote_path}')
    storage_client = storage.Client()
    bucket = storage_client.bucket(GCS_BUCKET)
    blob = bucket.blob(remote_path)
    try:
      blob.upload_from_filename(local_path)
      return True
    except Exception as e:
      print(f'Failed to upload blob {local_path} to {remote_path}')
      print(e)
      return False     
