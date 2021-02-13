import os

from flask import current_app
from flask import Blueprint
from flask import Flask
from flask import flash
from flask import render_template
from flask import redirect
from flask import request
from flask import send_file
from flask import url_for
from flask_cors import cross_origin
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

bp = Blueprint('flask_app', __name__, url_prefix='/')

visits = 0
comments = []


@bp.route('/game/<input>')
def game(input: str) -> str:
  """Print 'DND!' as the response body."""
  global visits
  visits += 1
  return f'Papapapapapapa {input}, visits: {visits}'


@bp.route('/api/getCanvasSize')
@cross_origin()
def getCanvasSize() -> str:
  return '567x254'


@bp.route('/', methods=['GET'])
def index():
  return render_template('index.html')

@bp.route('/gameBoard', methods=['GET'])
def canvas():
  return render_template('canvas.html')

@bp.route('/sandbox', methods=['GET', 'POST'])
def client():
  global comments
  if request.method == 'GET':
    return render_template('client_page.html', comments=comments)
  comments.append(request.form['contents'])
  return redirect(url_for('.client'))


@bp.route('/uploadImage', methods=['POST'])
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
    filename = secure_filename(file.filename)
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    print(filename)
    return {'path': filename}
  print('We here')


@bp.route('/retrieve_image/<image_key>')
def retrieve_image(image_key):
  image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_key)
  return send_file(image_path)


def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
