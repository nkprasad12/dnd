import {ChatClient} from '_client/chat_box/chat_client';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ContextActionHandler} from '_client/game_board/controller/context_action_handler';
import {InteractionParamaters} from '_client/game_board/controller/interaction_state_machine';
import {connectTo} from '_client/server/socket_connection';
import {FakeConnection} from '_client/server/__mocks__/fake_connection';
import {NEW_MESSAGE} from '_common/chat/chat_events';
import {checkDefined} from '_common/preconditions';

jest.mock('_client/server/socket_connection');

beforeEach(() => {
  FakeConnection.resetAllSockets();
});

const CHAT_NAMESPACE = 'chat';

async function parameters(): Promise<InteractionParamaters> {
  const chatClient = await connectTo(CHAT_NAMESPACE).then(
    (socket) => new ChatClient(socket)
  );
  return {
    modelHandler: {getModel: () => {}} as any,
    controller: {} as any,
    chatClient: chatClient,
  };
}

describe('handleContextMenuItem on Attack', () => {
  const CHAT_BODY = 'Carpe Vinum';

  it('without metadata returns empty diff ', async (done) => {
    const handler = new ContextActionHandler(await parameters());
    const result = handler.handleContextMenuAction({
      item: ContextMenuItem.Attack,
    });

    expect(result).toStrictEqual({});
    done();
  });

  it('with metadata returns empty diff ', async (done) => {
    const handler = new ContextActionHandler(await parameters());
    const result = handler.handleContextMenuAction({
      item: ContextMenuItem.Attack,
      metadata: CHAT_BODY,
    });

    expect(result).toStrictEqual({});
    done();
  });

  it('with metadata sends chat message ', async (done) => {
    const handler = new ContextActionHandler(await parameters());
    handler.handleContextMenuAction({
      item: ContextMenuItem.Attack,
      metadata: CHAT_BODY,
    });

    const socket = checkDefined(FakeConnection.getFakeSocket(CHAT_NAMESPACE));
    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(NEW_MESSAGE)).toStrictEqual({body: CHAT_BODY});
    done();
  });
});
