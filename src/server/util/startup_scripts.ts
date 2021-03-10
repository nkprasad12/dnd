import fs from 'fs';

import {checkDefined} from '_common/preconditions';

export function writeGoogleCredentials() {
  const GOOGLE_APPLICATION_CREDENTIALS: string = checkDefined(
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  const GOOGLE_KEY: string = checkDefined(process.env.GOOGLE_KEY);
  fs.writeFileSync(GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_KEY);
}

export function createDataDirectories() {
  fs.mkdirSync('data/images', {recursive: true});
  fs.mkdirSync('data/server_db', {recursive: true});
  fs.mkdirSync('data/server_db/tokens', {recursive: true});
}
