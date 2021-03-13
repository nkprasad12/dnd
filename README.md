[![Test Status](https://github.com/nkprasad12/dnd/actions/workflows/ci-workflow.yaml/badge.svg)](https://github.com/nkprasad12/dnd/actions)
[![codecov](https://codecov.io/gh/nkprasad12/dnd/branch/main/graph/badge.svg?token=S5UQEM5QI1)](https://codecov.io/gh/nkprasad12/dnd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

***

**Command quick reference (see package.json)**

Command | Effect
------- | ------
`npm run build-client ` | Builds the client side code.
`npm run build-server` | Builds the server side code.
`npm run build` | Builds the client side code, server side code, and creates required directories.
`npm run start` | Starts the server (but does not build anything new). Site is accessible on the port specified in .env (e.g. http://localhost:5757/)
`npm run start:client-inc` | Builds client code only and starts the server.
`npm run start:full` | Builds all code and starts the server.
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
GOOGLE_KEY | Google API key for Cloud Storage. See [documentation](https://cloud.google.com/docs/authentication/production#passing_variable).
GOOGLE_APPLICATION_CREDENTIALS | Path where the Google API key will be written. See [documentation](https://cloud.google.com/docs/authentication/production#passing_variable).
GCS_BUCKET | Google Cloud Storage bucket to use for backups.
GOOGLE_API_KEY | Key for accessing Google APIs. Must be authorized for the Sheets API. See [documentation](https://developers.google.com/sheets/api/guides/authorizing#APIKey) on how to get one.

To start the server, from the root directory run:

`npm ci && npm run start:full`

***

**VS Code - Setting up Prettier**

After initial setup, run `npm install` to ensure you have the latest prettier config. Then, install the 
[Prettier VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). 
The project settings are already configured to use prettier as the default formatting for typescript,
and to format typescript on save using prettier. 

**VS Code - Integrating Jest**

After initial setup, install the [Jest Runner VS Code plugin](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner).
This will allow you to run and debug unit tests from within the VS Code UI when browsing a test file.
