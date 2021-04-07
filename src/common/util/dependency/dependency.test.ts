import {Singleton} from '_common/util/dependency/dependency';

describe('Singleton.create', () => {
  const SQUIRREL_BUT_IN_GERMAN = 'Eichhornchen';

  it('Returns an instance created from input provider', () => {
    const provider = () => {
      return {squirrel: SQUIRREL_BUT_IN_GERMAN};
    };
    const singletonProvider = Singleton.create(provider);

    const instance = singletonProvider();
    expect(instance.squirrel).toBe(SQUIRREL_BUT_IN_GERMAN);
  });

  it('Returns the same instance each time', () => {
    const provider = () => {
      return {squirrel: SQUIRREL_BUT_IN_GERMAN};
    };
    const singletonProvider = Singleton.create(provider);

    const firstInstance = singletonProvider();
    const secondInstance = singletonProvider();
    expect(firstInstance).toBe(secondInstance);
  });

  it('Only invokes the provider once', () => {
    const provider = jest.fn(() => SQUIRREL_BUT_IN_GERMAN);
    const singletonProvider = Singleton.create(provider);

    singletonProvider();
    singletonProvider();
    expect(provider).toHaveBeenCalledTimes(1);
  });

  it('Does not share state between singletons', () => {
    const firstProvider = jest.fn(() => SQUIRREL_BUT_IN_GERMAN);
    const secondProvider = jest.fn(() => SQUIRREL_BUT_IN_GERMAN);
    const firstSingleton = Singleton.create(firstProvider);
    const secondSingleton = Singleton.create(secondProvider);

    firstSingleton();
    expect(firstProvider).toHaveBeenCalledTimes(1);
    expect(secondProvider).toHaveBeenCalledTimes(0);

    secondSingleton();
    expect(firstProvider).toHaveBeenCalledTimes(1);
    expect(secondProvider).toHaveBeenCalledTimes(1);
  });
});
