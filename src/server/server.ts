import express from 'express';
import {Server} from 'socket.io';
import http from 'http';
import passport from 'passport';

import {setupLogin} from '_server/auth/login';
import {ROOT} from '_server/util/file_util';
import {imageRouter} from '_server/routes/images';
import {contentRouter} from '_server/routes/content';
import {writeGoogleCredentials} from '_server/util/startup_scripts';
import {registerBoardRoutes} from '_server/routes/socket/board_socket';


writeGoogleCredentials();
const app = express();
export const server = http.createServer(app);
const ioServer = new Server(server);
registerBoardRoutes(ioServer);
setupLogin(app, passport);
app.use(express.static('public'));

// Login routes
app.get('/', (_req, res) => {
  res.sendFile('public/templates/login.html', {root: ROOT});
});

app.post(
    '/',
    passport.authenticate(
        'local', {successRedirect: '/gameBoard', failureRedirect: '/'}));

app.use('/', imageRouter);
app.use('/', contentRouter);
