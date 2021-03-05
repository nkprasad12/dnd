import {handleRollCommand} from '_common/chat/command_handlers/roll_command_handler';


test('handleRollCommand returns error on invalid input', async (done) => {
  const result = await handleRollCommand('1s20');
  expect(result.header).toContain('not a valid');
  done();
});

test('handleRollCommand returns error on invalid dice number', async (done) => {
  const result = await handleRollCommand('0d20');
  expect(result.header).toContain('not a valid');
  done();
});

test('handleRollCommand returns error on invalid dice sides', async (done) => {
  const result = await handleRollCommand('2d0');
  expect(result.header).toContain('not a valid');
  done();
});

test('handleRollCommand gives result of simple input', async (done) => {
  const result = await handleRollCommand('2d20');
  expect(result.header).toContain('Result of');
  done();
});
