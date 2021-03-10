/* istanbul ignore file */
import {
  createDataDirectories,
  writeGoogleCredentials,
} from '_server/util/startup_scripts';

writeGoogleCredentials();
createDataDirectories();
