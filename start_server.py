#!/bin/env python3
from app import create_app, socketio

app = create_app()


if __name__ == '__main__':
    socketio.run(app, port=5000)
    # To run publically:
    # socketio.run(app, host='0.0.0.0', port=80)
