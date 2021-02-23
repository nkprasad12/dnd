from flask import Blueprint

main = Blueprint('main', __name__, url_prefix='/')

from . import backend, events, game_loader, user