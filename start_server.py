#!/bin/env python3
import os

from app import create_app, socketio
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.environ.get('PORT'))

app = create_app()


if __name__ == '__main__':
    print(f'Listening at {PORT}')
    socketio.run(app, host='0.0.0.0', port=PORT)
