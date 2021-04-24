/* istanbul ignore file */
require('module-alias/register');
import {
  createDataDirectories,
  writeGoogleCredentials,
} from '_server/util/startup_scripts';

writeGoogleCredentials();
createDataDirectories();
