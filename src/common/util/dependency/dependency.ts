export type Provider<T> = () => T;

export namespace Singleton {
  /**
   * Creates a singleton provider that invokes the given provider on the first
   * invocation, and caches the result for future invocations.
   */
  export function create<T>(provider: Provider<T>): Provider<T> {
    let instance: T | undefined = undefined;
    return () => {
      if (instance === undefined) {
        instance = provider();
      }
      return instance;
    };
  }
}
