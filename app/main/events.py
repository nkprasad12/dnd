import json
import os

from typing import List

from flask import current_app
from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

BOARD_UPDATE = 'board-update'
BOARD_CREATE_REQUEST = 'board-create-request'
BOARD_GET_REQUEST = 'board-get-request'
BOARD_GET_RESPONSE = 'board-get-response'
BOARD_GET_ALL_REQUEST = 'board-get-all-request'
BOARD_GET_ALL_RESPONSE = 'board-get-all-response'

BOARD_GET_ACTIVE_REQUEST = 'board-get-active-request'
BOARD_GET_ACTIVE_RESPONSE = 'board-get-active-response'

BOARD_SET_ACTIVE = 'board-set-active'

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
    board_id = message['id']
    board = _retrieve_board(board_id)
    # TODO: Cache this in memory and only save on disconnect
    _save_board(_merge_board_model(board, message))


@socketio.on(BOARD_CREATE_REQUEST, namespace='/board')
def board_create(message):
  print(f'[{BOARD_CREATE_REQUEST}] {message}')
  _save_board(message) 


@socketio.on(BOARD_GET_REQUEST, namespace='/board')
def board_get(message):
    print(f'[{BOARD_GET_REQUEST}] {message}')
    loaded_board = _retrieve_board(message)
    print(f'Sending {BOARD_GET_RESPONSE}: {loaded_board}')
    emit(BOARD_GET_RESPONSE, loaded_board)


@socketio.on(BOARD_GET_ALL_REQUEST, namespace='/board')
def board_get_all(message):
    print(f'[{BOARD_GET_ALL_REQUEST}] {message}')
    board_list = _retrieve_all_boards()
    print(f'Sending {BOARD_GET_ALL_RESPONSE}: {board_list}')
    emit(BOARD_GET_ALL_RESPONSE, board_list)


@socketio.on(BOARD_GET_ACTIVE_REQUEST, namespace='/board')
def board_get_active(message):
    print(f'[{BOARD_GET_ACTIVE_REQUEST}] {message}')
    active_id = _get_active_board()
    print(f'Sending {BOARD_GET_ACTIVE_RESPONSE}: {active_id}')
    emit(BOARD_GET_ACTIVE_RESPONSE, active_id)


@socketio.on(BOARD_SET_ACTIVE, namespace='/board')
def board_set_active(message):
    print(f'[{BOARD_SET_ACTIVE}] {message}')
    _set_active_board(message)


def _get_active_board() -> str:
  root = current_app.config['DB_FOLDER']
  try:
    with open(os.path.join(root, 'active.db'), 'r') as f:
      return f.read()
  except FileNotFoundError:
    return 'none'


def _set_active_board(id: str) -> None:
  root = current_app.config['DB_FOLDER']
  with open(os.path.join(root, 'active.db'), 'w') as f:
    f.write(id)


def _retrieve_all_boards() -> List[str]:
  root = current_app.config['DB_FOLDER']
  all_files = os.listdir(root)
  board_files = [board for board in all_files if board.endswith('.txt')]
  return [board.split('.')[0] for board in board_files]


def _get_board_file(board_id: str) -> None:
  root = current_app.config['DB_FOLDER']
  return os.path.join(root, f'{board_id}.txt')


def _retrieve_board(board_id: str) -> dict:
  try:
    with open(_get_board_file(board_id), 'r') as f:
      return json.loads(f.read())
  except (FileNotFoundError, json.JSONDecodeError):
    return {}


def _save_board(board: dict) -> None:
  # TODO: Use an actual database
  out_file = _get_board_file(board['id'])
  with open(out_file, 'w') as f:
    f.write(json.dumps(board))
  print(f'Board saved to {out_file}')


# TODO: This should be a proto
def _merge_board_model(model: dict, diff: dict) -> dict:
  if model['id'] != diff['id']:
    print('_merge_board_model called with different ids!')   

  mergedTokens = diff['newTokens']
  for token in model['tokens']:
    if token['id'] in diff['removedTokens']:
      continue
    finalToken = token
    for tokenDiff in diff['tokenDiffs']:
      if tokenDiff['id'] == token['id']:
        finalToken = _merge_token_model(finalToken, tokenDiff)
        break
    mergedTokens.append(finalToken)

  fogOfWarState = model['fogOfWar']
  if 'fogOfWarDiffs' in diff:
    for d in diff['fogOfWarDiffs']:
      fogOfWarState[d['col']][d['row']] = d['isFogOn']
  
  if 'name' in diff:
    model['name'] = diff['name']
  if 'imageSource' in diff:
    model['imageSource'] = diff['imageSource']
  if 'tileSize' in diff:
    model['tileSize'] = diff['tileSize']
  model['tokens'] = mergedTokens
  model['fogOfWar'] = fogOfWarState

  return model


def _merge_token_model(model: dict, diff: dict) -> dict:
  if diff['id'] != model['id']:
    print('[_merge_token_model] Diff ID does not match current ID')
    return model
  if 'location' in diff:
    model['location'] = diff['location']
  if 'name' in diff:
    model['name'] = diff['name']
  if 'imageSource' in diff:
    model['imageSource'] = diff['imageSource']
  if 'size' in diff:
    model['size'] = diff['size']
  if 'speed' in diff:
    model['speed'] = diff['speed']
  return model