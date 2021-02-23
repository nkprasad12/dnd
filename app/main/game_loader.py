import json
import os

from typing import Optional, List

from flask import current_app


class GameLoader:

  def __init__(self):
    self._active_board: Optional[str] = None
    self._all_board_ids: Optional[List[str]] = None
    self._games: dict[str, dict] = {}


  def _get_board_file(self, board_id: str) -> None:
    """Returns the disk location of the given board."""
    root = current_app.config['DB_FOLDER']
    return os.path.join(root, f'{board_id}.txt')


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
    print(f'Writing active board: {id} to disk')
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
    """Saves the input board to disk."""
    # TODO: Use an actual database
    board_id = board['id']
    if self._all_board_ids is not None:
      self._all_board_ids.append(board_id)
    if board_id in self._games:
      self._games[board_id] = board
    out_file = self._get_board_file(board['id'])
    with open(out_file, 'w') as f:
      print(f'Saving {out_file} to disk')
      f.write(json.dumps(board))


  def retrieve_board(self, board_id: str) -> dict:
    """Retrieves the gives board from memory."""
    if board_id in self._games:
      print(f'Retrieving {board_id} from cache')
      return self._games[board_id]
    try:
      print(f'Retrieving {board_id} from disk')
      with open(self._get_board_file(board_id), 'r') as f:
        loaded_game = json.loads(f.read())
        self._games[board_id] = loaded_game
        return self._games[board_id]
    except (FileNotFoundError, json.JSONDecodeError):
      return {}