import {CommandType, processCommand} from '_server/chat/command_parser';


test('processCommand on non command gives error', () => {
  const result = processCommand('Restitutor Orbis Invictus');

  expect(result.command).toBeUndefined();
  expect(result.error).toBeDefined();
  expect(result.error?.possibleTypes.length).toBe(0);
});

test('processCommand on ambiguous command gives error', () => {
  const result = processCommand('!s');

  expect(result.command).toBeUndefined();
  expect(result.error).toBeDefined();
  expect(result.error?.possibleTypes.length).toBe(2);
  expect(result.error?.possibleTypes).toContain(CommandType.Save);
  expect(result.error?.possibleTypes).toContain(CommandType.SetCharacter);
});

test('processCommand on short input gives expected', () => {
  const result = processCommand('!r 1d20');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Roll);
});

test('processCommand on full input gives expected', () => {
  const result = processCommand('!roll 1d20');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Roll);
});

test('processCommand on check gives expected', () => {
  const result = processCommand('!check');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Check);
});

test('processCommand on shortest unambiguous gives expected', () => {
  const result = processCommand('!sa dex');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Save);
  expect(result.command?.query).toBe('dex');
});

test('processCommand on full save gives expected', () => {
  const result = processCommand('!save dex');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Save);
  expect(result.command?.query).toBe('dex');
});

test('processCommand on success with no query gives expected', () => {
  const result = processCommand('!help');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Help);
  expect(result.command?.query).toBe('');
});

test('processCommand with extra spaces gives expected', () => {
  const result = processCommand('!attack   longbow  ');

  expect(result.error).toBeUndefined();
  expect(result.command).toBeDefined();
  expect(result.command?.command).toBe(CommandType.Attack);
  expect(result.command?.query).toBe('longbow');
});
