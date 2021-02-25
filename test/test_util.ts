/** Exports functions that wrap test and expect, which give VS Code errors. */

function test_(name: string, body: () => any): void {
  // @ts-ignore
  test(name, body);
}

function expect_(obj: any): any {
  // @ts-ignore
  return expect(obj);
}

export {test_, expect_};
