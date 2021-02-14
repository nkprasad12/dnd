/** Exports functions that wrap test and expect, which give VS Code errors. */

function test_(name: string, body: () => any): void {
  test(name, body);
}

function expect_(obj: any): any {
  return expect(obj);
}

export { test_, expect_ }