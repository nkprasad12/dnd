export FLASK_DND_APPLICATION_SETTINGS=/home/nitin/Documents/code/dnd/settings.cfg

rm -r ./app/static/js/*
tsc -p ./app/static

# Replace /src/foo/bar -> /static/js/foo/bar.js in all generated .js files
find ./app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"].*)\/src\/(.*)([\'|\"])/\1\/static\/js\/\2.js\3/" 

# Replace ./foo/bar -> ./foo/bar.js in all generated .js files
find ./app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"]\.\/.*)([\'|\"])/\1.js\2/" 

sudo -E python3 ./start_server.py
