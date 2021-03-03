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

Clone the repository. To start the server, from the root directory run:

`npm ci && npm run full-start`