from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

visits = 0


@socketio.on('nitin', namespace='/chat')
def nitintest(message):
    global visits
    visits += 1
    print(f"Got message: {message} # {visits}")
    emit('nitin', {'data': f'BLAHBLAH{visits}'}, broadcast=True)


@socketio.on('board-update', namespace='/board')
def nitintest(message):
    print(f"Got message: {message}")
    emit('board-update', message, broadcast=True)
