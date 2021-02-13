export FLASK_APP=dnd
export FLASK_ENV=development
tsc dnd/static/js/client.ts
tsc dnd/static/js/upload.ts
flask run
# This will cause it to be pubically available
# flask run --host=0.0.0.0