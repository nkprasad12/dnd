import {handleRollCommand} from '_common/chat/command_handlers/roll_command_handler';


test('handleRollCommand returns error on invalid input', () => {
  const result = handleRollCommand('1s20');
  expect(result.header).toContain('not a valid');
});

test('handleRollCommand returns error on invalid dice number', () => {
  const result = handleRollCommand('0d20');
  expect(result.header).toContain('not a valid');
});

test('handleRollCommand returns error on invalid dice sides', () => {
  const result = handleRollCommand('2d0');
  expect(result.header).toContain('not a valid');
});

test('handleRollCommand gives result of simple input', () => {
  const result = handleRollCommand('2d20');
  expect(result.header).toContain('Result of');
});
