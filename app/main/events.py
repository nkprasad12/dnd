import json
import os

from flask import current_app
from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

BOARD_UPDATE = 'board-update'
BOARD_CREATE_REQUEST = 'board-create-request'
BOARD_GET_REQUEST = 'board-get-request'
BOARD_GET_RESPONSE = 'board-get-response'

visits = 0


@socketio.on('nitin', namespace='/chat')
def chat_nitin(message):
    global visits
    visits += 1
    print(f'Got message: {message} # {visits}')
    emit('nitin', {'data': f'BLAHBLAH{visits}'}, broadcast=True)


@socketio.on(BOARD_UPDATE, namespace='/board')
def board_update(message):
    print(f'[{BOARD_UPDATE}] {message}')
    emit(BOARD_UPDATE, message, broadcast=True, include_self=False)


@socketio.on(BOARD_CREATE_REQUEST, namespace='/board')
def board_create(message):
  print(f'[{BOARD_CREATE_REQUEST}] {message}')
  _save_board(message) 


@socketio.on(BOARD_GET_REQUEST, namespace='/board')
def board_update(message):
    print(f'[{BOARD_GET_REQUEST}] {message}')
    loaded_board = _retrieve_board(message)
    print(f'Sending {BOARD_GET_RESPONSE}: {loaded_board}')
    emit(BOARD_GET_RESPONSE, loaded_board)


def _get_board_file(board_id: str) -> None:
  root = current_app.config['DB_FOLDER']
  return os.path.join(root, f'{board_id}.txt')


def _retrieve_board(board_id: str) -> dict:
  try:
    with open(_get_board_file(board_id), 'r') as f:
      return json.loads(f.read())
  except FileNotFoundError | json.JSONDecodeError:
    return {}


def _save_board(board: dict) -> None:
  # TODO: Use an actual database
  out_file = _get_board_file(board['id'])
  with open(out_file, 'w') as f:
    f.write(json.dumps(board))
  print(f'Board saved to {out_file}')