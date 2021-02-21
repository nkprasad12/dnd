import os
import logging

from flask import Flask
from flask_cors import CORS
import flask_login
from flask_login import LoginManager, UserMixin
from flask_socketio import SocketIO

UPLOAD_FOLDER = 'data/images'
DB_FOLDER = 'data/server_db'

socketio = SocketIO()


def create_app(test_config=None):
    # create and configure the app
    logging.getLogger('flask_cors').level = logging.DEBUG
    login_manager = LoginManager()
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    login_manager.init_app(app)

    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, UPLOAD_FOLDER)
    app.config['DB_FOLDER'] = os.path.join(app.root_path, DB_FOLDER)
    app.config.from_envvar('FLASK_DND_APPLICATION_SETTINGS')
    if app.config['SECRET_KEY'] is None:
      raise RuntimeError('No secret key was found!')

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

    @login_manager.user_loader
    def load_user(user_id):
      print(f'load_user: {user_id}')
      from .main import user
      return user.get(user_id)

    return app
