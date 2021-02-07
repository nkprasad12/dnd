
# A very simple Flask Hello World app for you to get started with...

from flask import Flask
from flask import render_template

app = Flask(__name__)
app.config['DEBUG'] = True

visits = 0


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


@app.route('/client')
def client():
  return render_template('client_page.html')