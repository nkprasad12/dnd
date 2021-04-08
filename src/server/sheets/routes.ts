import {ensureLoggedIn} from 'connect-ensure-login';
import express from 'express';
import {LOAD_SHEET_ROUTE} from '_common/character_sheets/constants';
import {RemoteSheetCache} from '_server/sheets/remote_sheet_cache';

// eslint-disable-next-line new-cap
export const sheetRouter = express.Router();
sheetRouter.use(ensureLoggedIn('/'));

sheetRouter.get(`/${LOAD_SHEET_ROUTE}/:sheetId`, (req, res) => {
  const sheetId = req.params.sheetId;
  if (sheetId === undefined) {
    res.status(404).end('No sheetId was given.');
    return;
  }
  RemoteSheetCache.get()
    .load(sheetId)
    .then((result) => res.json(result.loadedData))
    .catch(() => res.status(404).end(`Invalid sheetId: ${sheetId}`));
});
