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
  expect(result.header).toContain('result:');
  done();
});

test('handleRollCommand gives result of compound rolls', async (done) => {
  const result = await handleRollCommand('2d20+3d8+1d6');
  expect(result.header).toContain('result:');
  done();
});

test('handleRollCommand gives error for bad compound roll', async (done) => {
  const result = await handleRollCommand('2d20+3s8+1d6');
  console.log(result);
  expect(result.header).toContain('not a valid');
  done();
});

test('handleRollCommand result for compound with constants', async (done) => {
  const result = await handleRollCommand('2d20+ 6 + 1d8+1d6+3');
  console.log(result);
  expect(result.header).toContain('result:');
  done();
});

test('handleRollCommand result roll with advantage', async (done) => {
  const result = await handleRollCommand('2d20+1d6+3 @adv');
  console.log(result);
  expect(result.header).toContain('result:');
  expect(result.body).toContain('max');
  done();
});

test('handleRollCommand result roll with disadvantage', async (done) => {
  const result = await handleRollCommand('2d20+1d6+3 @DISAD');
  console.log(result);
  expect(result.header).toContain('result:');
  expect(result.body).toContain('min');
  done();
});

test('handleRollCommand result roll with bad adb input', async (done) => {
  const result = await handleRollCommand('2d20+1d6+3 @Avantage');
  console.log(result);
  expect(result.header).toContain('Could not parse');
  done();
});
