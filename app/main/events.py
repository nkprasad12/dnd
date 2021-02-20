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
