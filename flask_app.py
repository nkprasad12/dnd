
# A very simple Flask Hello World app for you to get started with...

from flask import Flask

app = Flask(__name__)


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


