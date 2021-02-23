from __future__ import annotations

import json
import os
import time
import threading

from typing import Optional, List

from flask import current_app

_Timer = threading.Timer

CACHE_SAVE_INTERVAL_SEC = 60


def _get_board_file(board_id: str) -> str:
  """Returns the disk location of the given board."""
  root = current_app.config['DB_FOLDER']
  return os.path.join(root, f'{board_id}.txt')


def _load_board(path: str) -> Optional[dict]:
  """Loads a board from disk."""
  try:
    print(f'Retrieving {path} from disk')
    with open(path, 'r') as f:
      loaded_game = json.loads(f.read())
  except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f'Error loading board: {e}')
    loaded_game = None
  return loaded_game


def _save_board(out_file: str, board: dict) -> None:
  with open(out_file, 'w') as f:
    print(f'Saving board to disk at {out_file}')
    f.write(json.dumps(board))


class _CachedGame:

  @classmethod
  def load_from_disk(cls, id: str) -> Optional[_CachedGame]:
    save_path = _get_board_file(id)
    current_time = time.time()
    board = _load_board(save_path)
    if board is None:
      return None
    # Set the update time to be at some point before the current time.
    update_time = current_time - 1
    return cls(save_path=save_path, game_data=board, update_time=update_time, 
               save_time=current_time)

  @classmethod
  def new_board(cls, id: str, board: dict) -> _CachedGame:
    save_path = _get_board_file(id)
    current_time = time.time()
    return cls(save_path=save_path, game_data=board, update_time=current_time,
               save_time=-1)

  def __init__(self, save_path: str, game_data: dict, 
               update_time: float, save_time: float):
    self.save_path: str = save_path

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
    the cache. Never update the disks. 

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
        _save_board(item.save_path, item.game_data)
    _Timer(CACHE_SAVE_INTERVAL_SEC, self.save).start()


class GameLoader:

  def __init__(self):
    self._active_board: Optional[str] = None
    self._all_board_ids: Optional[List[str]] = None
    self._game_cache: _GameCache = _GameCache()

  def get_active_board(self) -> str:
    """Returns the ID of the active board."""
    if self._active_board is not None:
      print(f'Got active board from cache')
      return self._active_board
    root = current_app.config['DB_FOLDER']
    print(f'Getting active board from memory')
    try:
      with open(os.path.join(root, 'active.db'), 'r') as f:
        active_board = f.read()
        self._active_board = active_board
        return self._active_board
    except FileNotFoundError:
      return 'none'

  def set_active_board(self, id: str) -> None:
    """Sets the active board ID."""
    self._active_board = id
    root = current_app.config['DB_FOLDER']
    print(f'Writing active board id: {id} to disk')
    with open(os.path.join(root, 'active.db'), 'w') as f:
      f.write(id)

  def retrieve_all_board_ids(self) -> List[str]:
    """Retrieves all the stores board IDs."""
    if self._all_board_ids is not None:
      print(f'Return all board IDs from cache')
      return self._all_board_ids
    print(f'Reading all board IDs from disk')
    root = current_app.config['DB_FOLDER']
    all_files = os.listdir(root)
    board_files = [board for board in all_files if board.endswith('.txt')]
    self._all_board_ids = [board.split('.')[0] for board in board_files]
    return self._all_board_ids

  def save_board(self, board: dict) -> None:
    """Saves the input board, overwriting an existing board with the same ID."""
    # TODO: Use an actual database
    board_id = board['id']
    if self._all_board_ids is not None:
      self._all_board_ids.append(board_id)
    self._game_cache.update_board(board_id, board)

  def retrieve_board(self, board_id: str) -> dict:
    """Retrieves the gived board."""
    board = self._game_cache.get_board(board_id)
    if board is None:
      return {}
    return board
