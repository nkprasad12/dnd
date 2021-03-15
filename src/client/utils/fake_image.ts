const RealImage = Image;
jest.useFakeTimers();

function loadEvent(): any {
  const canvasImageSource: any = {};
  return {currentTarget: canvasImageSource};
}

export namespace FakeImage {
  export const instances: FakeImage[] = [];

  export class FakeImage {
    hasAutoloaded = false;
    onLoadCalled = false;
    public readonly width: string = '57';
    public readonly height: string = '420';
    public src: string | undefined = undefined;
    constructor() {
      instances.push(this);
    }

    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onload(event: Event): void {
      this.onLoadCalled = true;
    }

    /* istanbul ignore next */
    onerror(): void {}
  }

  export function invokeBeforeAll(autoLoad: boolean = true): void {
    // @ts-ignore
    global.Image = FakeImage;
    if (autoLoad) {
      setInterval(() =>
        instances.forEach((image) => {
          if (image.hasAutoloaded) {
            return;
          }
          image.hasAutoloaded = true;
          image.onload(loadEvent());
        }, 10)
      );
    }
  }

  export function invokeBeforeEach(): void {
    while (instances.length > 0) {
      instances.pop();
    }
  }

  export function invokeAfterAll(): void {
    global.Image = RealImage;
  }
}
