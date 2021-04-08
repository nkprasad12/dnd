export namespace Promises {
  /**
   * Returns a promise that resolves to the input promise if it resolves and
   * resolves to the given default if the input promise rejects.
   */
  export async function defaultTo<T, S>(
    promise: Promise<T>,
    defaultTo: S
  ): Promise<T | S> {
    return promise.catch((error) => {
      console.log(error);
      return defaultTo;
    });
  }
}
