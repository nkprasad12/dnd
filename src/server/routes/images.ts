import {ensureLoggedIn} from 'connect-ensure-login';
import express from 'express';
import fsPromises from 'fs';
import multer from 'multer';
import path from 'path';
import {storageUtil} from '_server/storage/storage_util';
import * as FileUtil from '_server/util/file_util';

const ROOT = FileUtil.getRoot();

// eslint-disable-next-line new-cap
export const imageRouter = express.Router();
imageRouter.use(ensureLoggedIn('/'));

const upload = multer({
  dest: path.join(ROOT, 'data/images'),
});


imageRouter.get(
    '/retrieve_image/:imageName',
    (req, res) => {
      const imageName = req.params.imageName;
      if (imageName === undefined) {
        res.status(403).end('Invalid image');
        return;
      }
      storageUtil().getImagePath(imageName)
          .then((imagePath) => res.sendFile(imagePath))
          .catch(() => res.status(403).end('Error retrieving image'));
    },
);

imageRouter.post(
    '/uploadImage',
    upload.single('file'),
    (req, res) => {
      const filePath = req.file.path;
      if (!FileUtil.isImage(req.file)) {
        fsPromises.unlink(filePath, () => {});
        res.status(403).contentType('text/plain').end('Invalid file type');
        return;
      }
      res.send({'path': storageUtil().saveImage(req.file)});
    });
