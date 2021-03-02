import {Server, Socket} from 'socket.io';

import * as Events from '_common/socket/board_events';


export function registerBoardRoutes(ioServer: Server): void {
  // TODO: Look into express-socket.io-session for security.
  ioServer
      .of('/board')
      .on('connection', (socket) => BoardSocketServerConnection.create(socket));
}

class BoardSocketServerConnection {
  static create(socket: Socket): BoardSocketServerConnection {
    const connection = new BoardSocketServerConnection(socket);
    connection.registerUpdates();
    return connection;
  }

  private readonly loader: any;

  private constructor(private readonly socket: Socket) {
    console.log('New connection on namespace: board');
    // this.loader = whatever
  }

  private registerUpdates() {
    this.registerEventListener(Events.BOARD_UPDATE, (message) => {
      this.socket.broadcast.emit(Events.BOARD_UPDATE, message);
      this.loader.foo();
      // const board_id = message['id']
      // board = loader.retrieve_board(board_id)
      // # TODO: Save when we see no updates for long enough
      // loader.save_board(_merge_board_model(board, message))
    });
  }

  private registerEventListener(
      event: string, listener: (message: string) => any) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${message}`);
      listener(message);
    });
  }
}


// @socketio.on(BOARD_CREATE_REQUEST, namespace='/board')
// def board_create(message):
//     global loader
//     print(f'[{BOARD_CREATE_REQUEST}] {message}')
//     loader.save_board(message)


// @socketio.on(BOARD_GET_REQUEST, namespace='/board')
// def board_get(message):
//     global loader
//     print(f'[{BOARD_GET_REQUEST}] {message}')
//     loaded_board = loader.retrieve_board(message)
//     board_str = str(loaded_board)
//     board_str = board_str.replace('False, ', '0')
//     board_str = board_str.replace('False', '0')
//     board_str = board_str.replace('True, ', '1')
//     board_str = board_str.replace('True', '1')
//     print(f'Sending {BOARD_GET_RESPONSE}: {board_str}')
//     emit(BOARD_GET_RESPONSE, loaded_board)


// @socketio.on(BOARD_GET_ALL_REQUEST, namespace='/board')
// def board_get_all(message):
//     global loader
//     print(f'[{BOARD_GET_ALL_REQUEST}] {message}')
//     board_list = loader.retrieve_all_board_ids()
//     print(f'Sending {BOARD_GET_ALL_RESPONSE}: {board_list}')
//     emit(BOARD_GET_ALL_RESPONSE, board_list)


// @socketio.on(BOARD_GET_ACTIVE_REQUEST, namespace='/board')
// def board_get_active(message):
//     global loader
//     print(f'[{BOARD_GET_ACTIVE_REQUEST}] {message}')
//     active_id = loader.get_active_board()
//     if active_id is None:
//       active_id = 'ERROR'
//     print(f'Sending {BOARD_GET_ACTIVE_RESPONSE}: {active_id}')
//     emit(BOARD_GET_ACTIVE_RESPONSE, active_id)


// @socketio.on(BOARD_SET_ACTIVE, namespace='/board')
// def board_set_active(message):
//     global loader
//     print(f'[{BOARD_SET_ACTIVE}] {message}')
//     loader.set_active_board(message)


// # TODO: This should be a proto
// def _merge_board_model(model: dict, diff: dict) -> dict:
//   if model['id'] != diff['id']:
//     print('_merge_board_model called with different ids!')

//   mergedTokens = diff['newTokens']
//   for token in model['tokens']:
//     if token['id'] in diff['removedTokens']:
//       continue
//     finalToken = token
//     for tokenDiff in diff['tokenDiffs']:
//       if tokenDiff['id'] == token['id']:
//         finalToken = _merge_token_model(finalToken, tokenDiff)
//         break
//     mergedTokens.append(finalToken)

//   fogOfWarState = model['fogOfWar']
//   if 'fogOfWarDiffs' in diff:
//     for d in diff['fogOfWarDiffs']:
//       fogOfWarState[d['col']][d['row']] = '1' if d['isFogOn'] else '0'
//   if 'publicSelectionDiffs' in diff:
//     if model.get('publicSelection') is None:
//       publicSelection = []
//       cols = len(fogOfWarState)
//       rows = len(fogOfWarState[0])
//       for col in range(cols):
//         publicSelection.append(['0'] * rows)
//     else:
//       publicSelection = model['publicSelection']
//     for d in diff['publicSelectionDiffs']:
//       publicSelection[d['col']][d['row']] = d['value']

//   if 'name' in diff:
//     model['name'] = diff['name']
//   if 'imageSource' in diff:
//     model['imageSource'] = diff['imageSource']
//   if 'tileSize' in diff:
//     model['tileSize'] = diff['tileSize']
//   model['tokens'] = mergedTokens
//   model['fogOfWar'] = fogOfWarState
//   model['publicSelection'] = publicSelection

//   return model


// def _merge_token_model(model: dict, diff: dict) -> dict:
//   if diff['id'] != model['id']:
//     print('[_merge_token_model] Diff ID does not match current ID')
//     return model
//   if 'location' in diff:
//     model['location'] = diff['location']
//   if 'name' in diff:
//     model['name'] = diff['name']
//   if 'imageSource' in diff:
//     model['imageSource'] = diff['imageSource']
//   if 'size' in diff:
//     model['size'] = diff['size']
//   if 'speed' in diff:
//     model['speed'] = diff['speed']
//   return model
