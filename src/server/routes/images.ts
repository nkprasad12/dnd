import {ensureLoggedIn} from 'connect-ensure-login';
import express from 'express';
import fsPromises from 'fs';
import multer from 'multer';
import path from 'path';
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
      const imagePath = path.join(ROOT, 'data/images', imageName);
      if (!fsPromises.existsSync(imagePath)) {
        res.status(403).end('Invalid image');
        return;
      }
      res.sendFile(imagePath);
    },
);

imageRouter.post(
    '/uploadImage',
    upload.single('file'),
    (req, res) => {
      const filePath = req.file.path;
      const imagePath = path.join(ROOT, 'data/images', req.file.originalname);
      if (!FileUtil.isImage(req.file)) {
        fsPromises.unlink(filePath, () => {});
        res.status(403).contentType('text/plain').end('Invalid file type');
        return;
      }
      fsPromises.rename(filePath, imagePath, () => {});
      const filename = path.basename(imagePath);
      res.send({'path': filename});
    });
