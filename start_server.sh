echo 'Removing old generated javascript files'
echo '---------------------------------------'
rm -r ./app/static/js/*

echo 'Compiling typescript'
echo '---------------------------------------'
tsc -p ./app/static

echo 'Replacing imports in generated files'
echo '---------------------------------------'
# Replace /src/foo/bar -> /static/js/foo/bar.js in all generated .js files
find ./app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"].*)\/src\/(.*)([\'|\"])/\1\/static\/js\/\2.js\3/" 

# Replace ./foo/bar -> ./foo/bar.js in all generated .js files
find ./app/static/js -type f -name "*.js" | \
xargs sed -i -E \
"s/(import.*\{.+\}.*from.*[\'|\"]\.\/.*)([\'|\"])/\1.js\2/" 

echo 'Setting environment variables'
echo '---------------------------------------'
export FLASK_DND_APPLICATION_SETTINGS=/home/nitin/Documents/code/dnd/settings.cfg
echo $FLASK_DND_APPLICATION_SETTINGS

if [ "$1" == "full" ]; then
  echo 'Setting up virtualenv'
  echo '---------------------------------------'
  virtualenv venv
  source venv/bin/activate

  echo 'Installing dependencies'
  echo '---------------------------------------'
  venv/bin/pip3 install -r requirements.txt

  echo 'Creating data directories'
  echo '---------------------------------------'
  mkdir -p app/data/images
  mkdir -p app/data/server_db
  if [[ -f app/data/server_db/users.db ]]; then
    echo 'User DB already exists'
  else
    echo 'Creating empty user DB'
    touch app/data/server_db/users.db
    echo '{}' > app/data/server_db/users.db
  fi
else
  source venv/bin/activate
fi

echo 'Starting up server'
echo '---------------------------------------'
sudo -E venv/bin/python3 ./start_server.py
