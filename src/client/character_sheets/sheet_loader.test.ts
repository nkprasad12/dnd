import {SheetLoader} from '_client/character_sheets/sheet_loader';
import {getOrigin} from '_client/common/get_origin';
import {
  CALIGULA_DATA,
  CALIGULA_SHEET,
} from '_common/character_sheets/test_data';

const realFetch = global.fetch;

beforeAll(() => {
  replaceFetchJsonResult(undefined);
});

afterAll(() => {
  global.fetch = realFetch;
});

function replaceFetchJsonResult(jsonValue: any) {
  const mockFetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(jsonValue),
    })
  );
  // @ts-ignore
  global.fetch = mockFetch;
  return mockFetch;
}

describe('SheetLoader.load', () => {
  it('calls server correctly', () => {
    const mockFetch = replaceFetchJsonResult(CALIGULA_DATA);
    SheetLoader.load(CALIGULA_SHEET);
    const expectedEndpoint = getOrigin() + '/loadSheet/' + CALIGULA_SHEET;
    expect(mockFetch).toHaveBeenCalledWith(expectedEndpoint, {method: 'GET'});
  });

  it('rejects promise on invalid sheet', async () => {
    replaceFetchJsonResult({name: 'Caligula'});
    return expect(SheetLoader.load(CALIGULA_SHEET)).rejects.toThrow();
  });

  it('resolves expected value on value sheet', async () => {
    replaceFetchJsonResult(CALIGULA_DATA);
    const sheet = SheetLoader.load(CALIGULA_SHEET);
    return expect(sheet).resolves.toStrictEqual(CALIGULA_DATA);
  });
});
