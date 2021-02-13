export FLASK_APP=dnd
export FLASK_ENV=development
# tsc dnd/app/static/js/client.ts
# tsc dnd/app/static/js/upload.ts
# tsc dnd/apps/static/js/game_board.ts
tsc -p dnd/
python3 dnd/start_server.py
# This will cause it to be pubically available
# flask run --host=0.0.0.0