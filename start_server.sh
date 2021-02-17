export FLASK_APP=dnd
export FLASK_ENV=development
rm -r dnd/app/static/js/*
tsc -p dnd/app/static
# Replace /src/foo/bar -> /static/js/foo/bar.js in all generated .js files
find dnd/app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"].*)\/src\/(.*)([\'|\"])/\1\/static\/js\/\2.js\3/" 
# Replace ./foo/bar -> ./foo/bar.js in all generated .js files
find dnd/app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"]\.\/.*)([\'|\"])/\1.js\2/" 
python3 dnd/start_server.py
# This will cause it to be pubically available
# flask run --host=0.0.0.0
