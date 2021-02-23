#!/bin/bash

function build_js {
  echo 'Removing old generated javascript files';
  echo '---------------------------------------';
  rm -r ./app/static/js/*

  echo 'Compiling typescript'
  echo '---------------------------------------'
  tsc -p ./app/static
  rm -r ./app/static/js/test/*

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
}

function switch_to_venv {
  source venv/bin/activate
}

function setup_venv {
  echo 'Setting up virtualenv'
  echo '---------------------------------------'
  pip3 install virtualenv
  virtualenv venv
  switch_to_venv

  echo 'Installing dependencies'
  echo '---------------------------------------'
  venv/bin/pip3 install -r requirements.txt
}

function setup_dirs {
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
}

function start_server {
  echo 'Starting up server'
  echo '---------------------------------------'
  sudo venv/bin/python3 ./start_server.py
}

function start_server_deployed {
  echo 'Starting up server (deployed)'
  echo '---------------------------------------'
  python3 ./start_server.py
}

function default_run {
  echo 'Default run'
  build_js
  switch_to_venv
  start_server
}

function full_run {
  echo 'Full run'
  build_js
  setup_venv
  setup_dirs
  start_server
}

function heroku_run {
  echo 'Heroku run'
  build_js
  setup_dirs
  start_server_deployed
}

if [ "$1" == "" ]; then
  default_run
elif [ "$1" == "full" ]; then
  full_run
elif [ "$1" == "heroku" ]; then
  heroku_run
else
  echo 'Unrecognized argument'
fi
