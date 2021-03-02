import {DownloadResponse, Storage} from '@google-cloud/storage';
import {checkDefined} from '_common/preconditions';

const GCS_BUCKET = checkDefined(process.env.GCS_BUCKET);

const storage = new Storage();

export function downloadFile(
    source: string, dest: string): Promise<DownloadResponse> {
  return storage.bucket(GCS_BUCKET).file(source).download({destination: dest});
}
