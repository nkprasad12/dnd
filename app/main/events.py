import json
import os

from typing import List

from flask import current_app
from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

from . import game_loader

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
loader = game_loader.GameLoader()


@socketio.on('nitin', namespace='/chat')
def chat_nitin(message):
    global visits
    visits += 1
    print(f'Got message: {message} # {visits}')
    emit('nitin', {'data': f'BLAHBLAH{visits}'}, broadcast=True)


@socketio.on(BOARD_UPDATE, namespace='/board')
def board_update(message):
    global loader
    print(f'[{BOARD_UPDATE}] {message}')
    emit(BOARD_UPDATE, message, broadcast=True, include_self=False)
    board_id = message['id']
    board = loader.retrieve_board(board_id)
    # TODO: Save when we see no updates for long enough
    loader.save_board(_merge_board_model(board, message))


@socketio.on(BOARD_CREATE_REQUEST, namespace='/board')
def board_create(message):
    global loader
    print(f'[{BOARD_CREATE_REQUEST}] {message}')
    loader.save_board(message) 


@socketio.on(BOARD_GET_REQUEST, namespace='/board')
def board_get(message):
    global loader
    print(f'[{BOARD_GET_REQUEST}] {message}')
    loaded_board = loader.retrieve_board(message)
    board_str = str(loaded_board)
    board_str = board_str.replace('False, ', '0')
    board_str = board_str.replace('False', '0')
    board_str = board_str.replace('True, ', '1')
    board_str = board_str.replace('True', '1')
    print(f'Sending {BOARD_GET_RESPONSE}: {board_str}')
    emit(BOARD_GET_RESPONSE, loaded_board)


@socketio.on(BOARD_GET_ALL_REQUEST, namespace='/board')
def board_get_all(message):
    global loader
    print(f'[{BOARD_GET_ALL_REQUEST}] {message}')
    board_list = loader.retrieve_all_board_ids()
    print(f'Sending {BOARD_GET_ALL_RESPONSE}: {board_list}')
    emit(BOARD_GET_ALL_RESPONSE, board_list)


@socketio.on(BOARD_GET_ACTIVE_REQUEST, namespace='/board')
def board_get_active(message):
    global loader
    print(f'[{BOARD_GET_ACTIVE_REQUEST}] {message}')
    active_id = loader.get_active_board()
    print(f'Sending {BOARD_GET_ACTIVE_RESPONSE}: {active_id}')
    emit(BOARD_GET_ACTIVE_RESPONSE, active_id)


@socketio.on(BOARD_SET_ACTIVE, namespace='/board')
def board_set_active(message):
    global loader
    print(f'[{BOARD_SET_ACTIVE}] {message}')
    loader.set_active_board(message)


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