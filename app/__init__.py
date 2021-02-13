import os
import logging

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

UPLOAD_FOLDER = '/home/nitin/Documents/code/dnd/images'

socketio = SocketIO()


def create_app(test_config=None):
    # create and configure the app
    logging.getLogger('flask_cors').level = logging.DEBUG
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['SECRET_KEY'] = 'gjr39dkjn344_!67#'

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    socketio.init_app(app)

    return app
