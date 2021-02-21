import os
import logging

from flask import Flask
from flask_cors import CORS
import flask_login
from flask_login import LoginManager, UserMixin
from flask_socketio import SocketIO

UPLOAD_FOLDER = '/home/nitin/Documents/code/dnd/images'
DB_FOLDER = '/home/nitin/Documents/code/dnd/server_db'

socketio = SocketIO()


def create_app(test_config=None):
    # create and configure the app
    logging.getLogger('flask_cors').level = logging.DEBUG
    login_manager = LoginManager()
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    login_manager.init_app(app)

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['DB_FOLDER'] = DB_FOLDER
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

    @login_manager.user_loader
    def load_user(user_id):
      from .main import user
      return user.get(user_id)


    @login_manager.request_loader
    def request_loader(request):
      from .main import user
      username = request.form.get('username')
      users = user.get_users()
      if username not in users:
        return

      current = user.User()
      current.id = username
      current.is_authenticated = request.form['pw'] == users[username]['pw']
      return current

    return app
