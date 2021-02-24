from __future__ import annotations

import json
import os
import time
import threading

from typing import Optional, List

from flask import current_app

from . import file_util

_Timer = threading.Timer

CACHE_SAVE_INTERVAL_SEC = 60


def _get_board_key(board_id: str) -> str:
  """Returns the file key of the given board id."""
  return f'{board_id}.txt'


def _load_board(file_key: str) -> Optional[dict]:
  """Loads a board from disk."""
  contents = file_util.load_from_file(file_key)
  if contents is None:
    return None
  try:
    board = json.loads(contents)
    return board
  except (json.JSONDecodeError) as e:
    print(f'Error decoding board: {e}')
    return None


def _save_board(file_key: str, board: dict) -> None:
  file_util.save_to_file(json.dumps(board), file_key)


class _CachedGame:

  @classmethod
  def load_from_disk(cls, id: str) -> Optional[_CachedGame]:
    file_key = _get_board_key(id)
    current_time = time.time()
    board = _load_board(file_key)
    if board is None:
      return None
    # Set the update time to be at some point before the current time.
    update_time = current_time - 1
    return cls(file_key=file_key, game_data=board, update_time=update_time, 
               save_time=current_time)

  @classmethod
  def new_board(cls, id: str, board: dict) -> _CachedGame:
    file_key = _get_board_key(id)
    current_time = time.time()
    return cls(file_key=file_key, game_data=board, update_time=current_time,
               save_time=-1)

  def __init__(self, file_key: str, game_data: dict, 
               update_time: float, save_time: float):
    self.file_key: str = file_key
    self.update_time: float = update_time
    self.save_time: float = save_time
    self.game_data: dict = game_data


class _GameCache:
  
  def __init__(self):
    self._cache: dict[str, _CachedGame] = {}
    _Timer(CACHE_SAVE_INTERVAL_SEC, self.save).start()

  def update_board(self, id: str, board: dict) -> bool:
    """Updates the cache with the board with the given ID and data.
  
    If a board with the given ID did not already exist, creates a new board in 
    the cache. Never updates the disks. 

    Returns:
      Whether a new board was created.
    """
    if self.get_board(id) is None:
      self._cache[id] = _CachedGame.new_board(id, board)
      return True
    current_time = time.time()
    self._cache[id].game_data = board
    # Set to current + 1 in case the system time only has second precision
    self._cache[id].update_time = current_time + 1
    return False

  def get_board(self, id: str) -> Optional[dict]:
    """Returns the board with the given ID.
    
    If it is not in the cache, try to load it from the disk. If it is not on
    the disk, return None.
    """
    if id not in self._cache:
      loaded_board = _CachedGame.load_from_disk(id)
      if loaded_board is None:
        return None
      self._cache[id] = loaded_board
    return self._cache[id].game_data

  def save(self) -> None:
    print('Saving cache items to disk')
    for id in self._cache:
      item = self._cache[id]
      if item.save_time < item.update_time:
        item.save_time = item.update_time
        _save_board(item.file_key, item.game_data)
    _Timer(CACHE_SAVE_INTERVAL_SEC, self.save).start()


class GameLoader:

  def __init__(self):
    self._active_board: Optional[str] = None
    self._all_board_ids: Optional[List[str]] = None
    self._game_cache: _GameCache = _GameCache()

  def get_active_board(self) -> Optional[str]:
    """Returns the ID of the active board."""
    if self._active_board is not None:
      print(f'Got active board from cache')
      return self._active_board
    print(f'Getting active board from disk')
    active_board = file_util.load_from_file('active.db')
    if active_board is None:
      return None
    return active_board

  def set_active_board(self, id: str) -> None:
    """Sets the active board ID."""
    self._active_board = id
    print(f'Writing active board id: {id} to disk')
    file_util.save_to_file(id, 'active.db')

  def retrieve_all_board_ids(self) -> List[str]:
    """Retrieves all the stores board IDs."""
    if self._all_board_ids is not None:
      print(f'Return all board IDs from cache')
      return self._all_board_ids
    print(f'Reading all board IDs from disk')
    all_boards = file_util.load_from_file('all_boards.db')
    print(f'Got {all_boards}')
    if all_boards is None:
      self._all_board_ids = []
    else:
      try:
        parsed_boards = json.loads(all_boards)
        self._all_board_ids = parsed_boards
      except:
        self._all_board_ids = []
    print(f'All boards: {self._all_board_ids}')
    return self._all_board_ids

  def update_all_boards_ids(self, new_id: str) -> None:
    self.retrieve_all_board_ids()
    if new_id not in self._all_board_ids:
      self._all_board_ids.append(new_id)
      file_util.save_to_file(json.dumps(self._all_board_ids), 'all_boards.db')

  def save_board(self, board: dict) -> None:
    """Saves the input board, overwriting an existing board with the same ID."""
    # TODO: Use an actual database
    board_id = board['id']
    self._game_cache.update_board(board_id, board)
    self.update_all_boards_ids(board_id)

  def retrieve_board(self, board_id: str) -> dict:
    """Retrieves the gived board."""
    board = self._game_cache.get_board(board_id)
    if board is None:
      return {}
    return board
