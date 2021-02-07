
# A very simple Flask Hello World app for you to get started with...

from flask import Flask
from flask import render_template
from flask import redirect
from flask import request
from flask import url_for

app = Flask(__name__)
app.config['DEBUG'] = True

visits = 0
comments = []


@app.route('/')
def hello_dnd():
  """Print 'DND!' as the response body."""
  global visits
  visits += 1
  return f'Papapapapapapa {visits}'


@app.route('/game/<input>')
def game(input):
  """Print 'DND!' as the response body."""
  global visits
  visits += 1
  return f'Papapapapapapa {input}, visits: {visits}'


@app.route('/api/getCanvasSize')
def getCanvasSize():
  return '567x254'


@app.route('/canvas', methods=['GET'])
def canvas():
  if request.method == 'GET':
    return render_template('canvas.html')

@app.route('/client', methods=['GET', 'POST'])
def client():
  global comments
  if request.method == 'GET':
    return render_template('client_page.html', comments=comments)
  comments.append(request.form['contents'])
  return redirect(url_for('client'))