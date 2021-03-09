import {Autocompleter} from '_common/chat/autocompleter';

test('Autocompleter completes empty string with all options', () => {
  const completer = Autocompleter.create();
  const options = ['Diocletian', 'Farms', 'Cabbages'];
  const expected = options.map((s) => s.toLowerCase());
  completer.addOptions(options);

  expectArraysMatch(completer.getOptions(''), expected);
});

test('Autocompleter deduplicates repeated options', () => {
  const completer = Autocompleter.create();
  const options = ['Diocletian', 'Farms', 'Cabbages'];
  const expected = options.map((s) => s.toLowerCase());

  completer.addOptions(options);
  completer.addOption('Diocletian');

  expectArraysMatch(completer.getOptions(''), expected);
});

test('Autocompleter ignores leading whitespace', () => {
  const completer = Autocompleter.create();
  const options = ['Diocletian', 'Farms', 'Cabbages'];

  completer.addOptions(options);
  const results = completer.getOptions(' Dio');

  expect(results.length).toBe(1);
  expect(results[0]).toEqual('diocletian');
});

test('Autocompleter ignores case', () => {
  const completer = Autocompleter.create();
  const options = ['Diocletian', 'Farms', 'Cabbages'];

  completer.addOptions(options);
  const results = completer.getOptions('dio');

  expect(results.length).toBe(1);
  expect(results[0]).toEqual('diocletian');
});

test('Autocompleter rejects close branches', () => {
  const completer = Autocompleter.create();
  const options = ['diocletian', 'diofarms', 'dicabbages'];

  completer.addOptions(options);
  const results = completer.getOptions('dioc');

  expect(results.length).toBe(1);
  expect(results[0]).toEqual('diocletian');
});

test('Autocompleter returns all subpaths', () => {
  const completer = Autocompleter.create();
  const options = ['diocletian', 'diofarms', 'dicabbages'];

  completer.addOptions(options);
  const results = completer.getOptions('dio');

  expect(results.length).toBe(2);
  expect(results).toContain('diocletian');
  expect(results).toContain('diofarms');
});

test('Autocompleter will find full token if no prefix matches', () => {
  const completer = Autocompleter.create();
  const options = ['diocletian', 'farms', 'beautiful cabbages'];

  completer.addOptions(options);
  const results = completer.getOptions('cabbages');

  expect(results.length).toBe(1);
  expect(results).toContain('beautiful cabbages');
});

test('Autocompleter will prefix match first', () => {
  const completer = Autocompleter.create();
  const options = ['diocletian', 'farms', 'cabbages', 'beautiful cabbages'];

  completer.addOptions(options);
  const results = completer.getOptions('cabbages');

  expect(results.length).toBe(1);
  expect(results).toContain('cabbages');
});

function expectArraysMatch(first: string[], second: string[]): void {
  expect(first.sort()).toEqual(second.sort());
}
