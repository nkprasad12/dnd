#!/bin/bash

function build_js {
  echo 'Removing old generated javascript files';
  echo '---------------------------------------';
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
  venv/bin/python3 ./start_server.py
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
  start_server
}

function setup_only_run {
  echo 'Setup only run'
  build_js
  setup_venv
}

function server_only_run {
  echo 'Server only run'
  start_server
}

if [ "$1" == "" ]; then
  default_run
elif [ "$1" == "full" ]; then
  full_run
elif [ "$1" == "setup_only" ]; then
  setup_only_run
elif [ "$1" == "server_only" ]; then
  server_only_run
else
  echo 'Unrecognized argument'
fi
