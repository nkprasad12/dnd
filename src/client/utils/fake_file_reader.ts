/* istanbul ignore file */

import {checkDefined} from '_common/preconditions';

const RealFileReader = FileReader;

export namespace FakeFileReader {
  export class FakeFileReader {
    constructor() {}

    readAsDataURL() {
      this.onload(checkDefined(onLoadEvent));
    }

    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onload(event: Event): void {}
  }

  export function invokeBeforeAll(): void {
    // @ts-ignore
    global.FileReader = FakeFileReader;
  }

  let onLoadEvent: Event | undefined = undefined;
  export function setOnLoadEvent(event: Event) {
    onLoadEvent = event;
  }

  export function invokeAfterEach(): void {
    onLoadEvent = undefined;
  }

  export function invokeAfterAll(): void {
    global.FileReader = RealFileReader;
  }
}
