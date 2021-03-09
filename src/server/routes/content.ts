import {ensureLoggedIn} from 'connect-ensure-login';
import express from 'express';
import * as FileUtil from '_server/util/file_util';

const ROOT = FileUtil.ROOT;

// eslint-disable-next-line new-cap
export const contentRouter = express.Router();
contentRouter.use(ensureLoggedIn('/'));
contentRouter.use(express.static('genfiles_static'));

contentRouter.get('/index', (_req, res) => {
  res.sendFile('genfiles_static/info.html', {root: ROOT});
});

contentRouter.get('/boardTools', (_req, res) => {
  res.sendFile('genfiles_static/board_tools.html', {root: ROOT});
});

contentRouter.get('/gameBoard', (_req, res) => {
  res.sendFile('genfiles_static/game_board.html', {root: ROOT});
});

contentRouter.get('/sandbox', (_req, res) => {
  res.sendFile('genfiles_static/sandbox.html', {root: ROOT});
});
