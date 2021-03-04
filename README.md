![Test Status](https://github.com/nkprasad12/dnd/actions/workflows/client-tests.yaml/badge.svg)

***

**Command quick reference (see package.json)**

Command | Effect
------- | ------
`npm run build-client ` | Builds the client side code.
`npm run build-server` | Builds the server side code.
`npm run build` | Builds the client side code, server side code, and creates required directories.
`npm run start` | Starts the server (but does not build anything new).
`npm run full-start` | Builds all code and starts the server.
`npm run test` | Runs all tests.
`npm run coverage` | Runs all tests and creates a coverage report.

***

**Starting from scratch**

Clone the repository. Then, add a .env file in the root with values for the following:

Variable | Explanation
-------- | -----------
SECRET_KEY | Secret key for authentication. Generate a random byte string for this.
PORT | Which port the server should listen at.
ADMIN_USER | Username of admin, for login.
ADMIN_PASSWORD | Password of admin, for login.
GOOGLE_KEY | Google API key.
GOOGLE_APPLICATION_CREDENTIALS | Path where the Google API key will be written.
GCS_BUCKET | Google Cloud Storage bucket to use for backups.

To start the server, from the root directory run:

`npm ci && npm run full-start`

