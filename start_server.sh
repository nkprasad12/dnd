#!/bin/bash

function build_webpack {
  echo 'Building Webpack '
  echo '---------------------------------------'
  npx webpack
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
  echo 'Preparing templates'
  echo '---------------------------------------'
  mkdir -p app/templates/genfiles
  rm app/templates/genfiles/*
  cp app/static/dist/*.html app/templates/genfiles/
  # Replace Foo.bundle.js -> /static/dist/Foo.bundle.js in all generated .js files
  find ./app/templates/genfiles -type f -name "*.html" | \
  xargs sed -i -E -e \
  "s:\"([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.bundle\.js\"):\"\/static\/dist\/\1:g" 
}

function start_server {
  echo 'Starting up server'
  echo '---------------------------------------'
  sudo venv/bin/python3 ./write_google_credentials.py
  sudo venv/bin/python3 ./start_server.py
}

function start_server_deployed {
  echo 'Starting up server (deployed)'
  echo '---------------------------------------'
  python3 ./write_google_credentials.py
  python3 ./start_server.py
}

function default_run {
  echo 'Default run'
  build_webpack
  switch_to_venv
  setup_dirs
  start_server
}

function full_run {
  echo 'Full run'
  npm ci
  build_webpack
  setup_venv
  setup_dirs
  start_server
}

function heroku_run {
  echo 'Heroku run'
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
