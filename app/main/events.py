import json
import os

from flask import current_app
from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

visits = 0


@socketio.on('nitin', namespace='/chat')
def chat_nitin(message):
    global visits
    visits += 1
    print(f'Got message: {message} # {visits}')
    emit('nitin', {'data': f'BLAHBLAH{visits}'}, broadcast=True)


@socketio.on('board-update', namespace='/board')
def board_update(message):
    print(f'[board-update] {message}')
    emit('board-update', message, broadcast=True, include_self=False)


@socketio.on('board-create-request', namespace='/board')
def board_create(message):
  print(f'[board-create-request] {message}')
  _save_board(message) 


def _get_board_file(board_id: str) -> None:
  root = current_app.config['DB_FOLDER']
  return os.path.join(root, f'{board_id}.txt')


def _save_board(board: str) -> None:
  # TODO: Use an actual database
  out_file = _get_board_file(board['id'])
  with open(out_file, 'w') as f:
    f.write(json.dumps(board))
  print(f'Board saved to {out_file}')