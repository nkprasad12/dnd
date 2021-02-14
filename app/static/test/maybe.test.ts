import { Maybe } from "../src/utils/maybe"

class TestObject {
    foo: number;

    constructor(foo: number) {
        this.foo = foo;
    }
}

test('Absent Maybe returns present false', () => {
    expect(Maybe.absent().present()).toBe(false);
});

test('Present Maybe returns present true', () => {
    let testObject = new TestObject(5);
    expect(Maybe.of(testObject).present()).toBe(true);
});

test('Present Maybe returns original', () => {
    let testObject = new TestObject(5);
    expect(Maybe.of(testObject).get()).toBe(testObject);
});