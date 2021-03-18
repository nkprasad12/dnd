import {ensureLoggedIn} from 'connect-ensure-login';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import * as FileUtil from '_server/util/file_util';

const ROOT = FileUtil.ROOT;

// eslint-disable-next-line new-cap
export const contentRouter = express.Router();
contentRouter.use(ensureLoggedIn('/'));
contentRouter.use(expressStaticGzip('genfiles_static', {index: false}));

contentRouter.get('/boardTools', (_req, res) => {
  res.sendFile('genfiles_static/board_tools.html', {root: ROOT});
});

contentRouter.get('/gameBoard', (_req, res) => {
  res.sendFile('genfiles_static/game_board.html', {root: ROOT});
});

contentRouter.get('/sandbox', (_req, res) => {
  res.sendFile('genfiles_static/sandbox.html', {root: ROOT});
});
