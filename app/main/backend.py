import os

from . import main

from flask import current_app
from flask import Blueprint
from flask import Flask
from flask import flash
from flask import render_template
from flask import redirect
from flask import request
from flask import send_file
from flask import session
from flask import url_for

from flask_cors import cross_origin
import flask_login
from flask_login import login_required
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

comments = []


@main.route('/', methods=['GET', 'POST'])
def login():
  if request.method == 'POST':
    username = request.form.get('username')
    from . import user
    users = user.get_users()
    print('login: Checking user')
    if username not in users: 
      return render_template('login.html')
    print('login: Checking password')
    if request.form.get('pw') == users[username]['pw']:
      user = user.User()
      user.id = username
      flask_login.login_user(user)
      return redirect(url_for('.game_board'))
  return render_template('login.html')


@main.route('/index', methods=['GET'])
@login_required
def index():
    return render_template('index.html')


@main.route('/boardTools', methods=['GET'])
@login_required
def board_tools():
    return render_template('board_tools.html')


@main.route('/gameBoard', methods=['GET'])
@login_required
def game_board():
    return render_template('game_board.html')


@main.route('/sandbox', methods=['GET', 'POST'])
@login_required
def client():
    global comments
    if request.method == 'GET':
        return render_template('client_page.html', comments=comments)
    comments.append(request.form['contents'])
    return redirect(url_for('.client'))


@main.route('/uploadImage', methods=['POST'])
@login_required
def upload_file():
    print('Got uploadImage request')
    # check if the post request has the file part
    if 'file' not in request.files:
        print('No file part')
        flash('No file part')
        return 'Record not found', 400
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        print('No selected file')
        flash('No selected file')
        return 'Record not found', 400
    if file and _allowed_file(file.filename):
        # TODO: Append UUID to the file name to prevent duplicates.
        #       also record the simple name.
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        print(filename)
        return {'path': filename}
    print('We here')


@main.route('/retrieve_image/<image_key>')
@login_required
def retrieve_image(image_key):
    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_key)
    return send_file(image_path)


def _allowed_file(filename):
    return '.' in filename and \
      filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
