// @ts-ignore
import { test_, expect_ } from "../test_util.ts"

import { Maybe } from "../../src/utils/maybe"

class TestObject {
  foo: number;

  constructor(foo: number) {
    this.foo = foo;
  }
}

test_('Absent Maybe returns present false', () => {
  expect_(Maybe.absent().present()).toBe(false);
});

test_('Present Maybe returns present true', () => {
  let testObject = new TestObject(5);
  expect_(Maybe.of(testObject).present()).toBe(true);
});

test_('Present Maybe returns original', () => {
  let testObject = new TestObject(5);
  expect_(Maybe.of(testObject).get()).toBe(testObject);
});