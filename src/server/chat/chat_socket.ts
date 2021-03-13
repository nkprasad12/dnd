import {Server, Socket} from 'socket.io';

import * as Events from '_common/chat/chat_events';
import {isChatMessage} from '_common/chat/chat_model';
import {commandResolver} from '_common/chat/chat_resolver';
import {CommandType} from '_common/chat/command_parser';
import {loadCommandHandler} from '_common/chat/command_handlers/load_command_handler';
import {lookupCommandHandler} from '_common/chat/command_handlers/lookup_command_handler';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {extractSheetData} from '_server/sheets/sheets';
import {CharacterResolver} from '_common/chat/command_handlers/character_resolver';
import {
  attackCommandHandler,
  checkCommandHandler,
  saveCommandHandler,
} from '_common/chat/command_handlers/character_command_handlers';
import {storageUtil} from '_server/storage/storage_util';
import {isStringArray} from '_common/verification';
import {Spell} from '_common/chat/command_handlers/types';

export async function registerChatRoutes(ioServer: Server): Promise<void> {
  // TODO: Look into express-socket.io-session for security.
  const cache = CharacterSheetCache.create(extractSheetData);
  const preloader = new SheetPreloader(cache);
  const resolver = CharacterResolver.create(cache);

  const spellLoader = new SpellLoader();
  const spells = await spellLoader.load();

  commandResolver().addCommandHandler(
    CommandType.Load,
    loadCommandHandler(cache)
  );
  commandResolver().addCommandHandler(
    CommandType.Attack,
    attackCommandHandler(resolver)
  );
  commandResolver().addCommandHandler(
    CommandType.Check,
    checkCommandHandler(resolver)
  );
  commandResolver().addCommandHandler(
    CommandType.Save,
    saveCommandHandler(resolver)
  );
  commandResolver().addCommandHandler(
    CommandType.Lookup,
    lookupCommandHandler(spells)
  );

  ioServer.of('/chat').on('connection', (socket) => {
    preloader.preLoad();
    ChatSocketServerConnection.create(socket);
  });
}

class SpellLoader {
  private hasLoaded = false;
  private spells: Spell[] = [];

  async load() {
    try {
      if (this.hasLoaded && this.spells != []) {
        return this.spells;
      }

      const spellData = await storageUtil().loadFromFile('dndSpellData.json');
      const spellObj = JSON.parse(spellData);
      this.spells = spellObj['jsonSpellData'];
    } catch {
      console.log('Failed to retrieve spells');
    }

    return this.spells;
  }
}

class SheetPreloader {
  private hasPreloaded = false;

  constructor(private readonly cache: CharacterSheetCache) {}

  async preLoad() {
    if (this.hasPreloaded) {
      return;
    }
    this.hasPreloaded = true;
    try {
      const sheetData = await storageUtil().loadFromFile('saved_sheets.db');
      console.log('Found saved sheets: ' + sheetData);
      const sheets = JSON.parse(sheetData);
      if (!isStringArray(sheets)) {
        return;
      }
      sheets.forEach(async (sheet) => await this.cache.load(sheet));
    } catch {}
  }
}

class ChatSocketServerConnection {
  static create(socket: Socket): ChatSocketServerConnection {
    const connection = new ChatSocketServerConnection(socket);
    connection.handleNewMessages();
    return connection;
  }

  private constructor(private readonly socket: Socket) {
    console.log('New connection on namespace: chat');
  }

  private handleNewMessages() {
    this.registerEventListener(Events.NEW_MESSAGE, (message) => {
      this.socket.broadcast.emit(Events.NEW_MESSAGE, message);
      this.possiblyHandleCommand(message);
    });
  }

  private async possiblyHandleCommand(input: string): Promise<void> {
    if (!isChatMessage(input)) {
      return;
    }
    console.log('possiblyHandleCommand ' + input.body);
    const result = await commandResolver().handleCommand(input.body);
    if (!result) {
      return;
    }
    this.socket.emit(Events.NEW_MESSAGE, result);
    this.socket.broadcast.emit(Events.NEW_MESSAGE, result);
  }

  private registerEventListener(
    event: string,
    listener: (message: string) => any
  ) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${message}`);
      listener(message);
    });
  }
}
