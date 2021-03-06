import {commandResolver} from '_common/chat/chat_resolver';
import {CommandType} from '_common/chat/command_parser';

test('processCommand on non command gives error', async (done) => {
  const commandString = 'Not because it is easy';
  const result = await commandResolver().handleCommand(commandString);

  expect(result).toBeUndefined();
  done();
});

test('processCommand with ambiguous command gives error', async (done) => {
  const commandString = '! but because it is hahhd';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('Got ambiguous command');
  done();
});

test('processCommand with roll gives expected', async (done) => {
  const commandString = '!roll 2d20';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('result:');
  done();
});

test('processCommand with attack gives expected', async (done) => {
  const commandString = '!attack longbow';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('command reference');
  done();
});

test('processCommand with check gives expected', async (done) => {
  const commandString = '!check animal handling';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('command reference');
  done();
});

test('processCommand with save gives expected', async (done) => {
  const commandString = '!save dex';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('command reference');
  done();
});

test('processCommand with help gives expected', async (done) => {
  const commandString = '!help';
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.header).toContain('command reference');
  done();
});

test('processCommand with override gives expected', async (done) => {
  const commandString = '!load';
  commandResolver().addCommandHandler(CommandType.Load, async () => {
    return {body: 'It worked!'};
  });
  const result = await commandResolver().handleCommand(commandString);

  expect(result?.body).toBe('It worked!');
  done();
});
