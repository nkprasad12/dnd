from flask import Blueprint
from flask import Flask
from flask import render_template
from flask import redirect
from flask import request
from flask import url_for
from flask_cors import cross_origin

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
def canvas():
  return render_template('canvas.html')


@bp.route('/sandbox', methods=['GET', 'POST'])
def client():
  global comments
  if request.method == 'GET':
    return render_template('client_page.html', comments=comments)
  comments.append(request.form['contents'])
  return redirect(url_for('client'))