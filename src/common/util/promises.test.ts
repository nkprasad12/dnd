import {Promises} from '_common/util/promises';

describe('Promises.defaultTo', () => {
  const RESOLVED_VALUE = {truth: 'Game of Thrones has 6 seasons'};
  const BACKUP_VALUE = {changeMyMind: 'Snopes is actually Darth Darth Binks'};

  it('resolves to the original when original resolves', async () => {
    const promise = Promise.resolve(RESOLVED_VALUE);
    const wrapper = Promises.defaultTo(promise, BACKUP_VALUE);
    return expect(wrapper).resolves.toBe(RESOLVED_VALUE);
  });

  it('resolves to the backup when original rejects', async () => {
    const promise = Promise.reject(RESOLVED_VALUE);
    const wrapper = Promises.defaultTo(promise, BACKUP_VALUE);
    return expect(wrapper).resolves.toBe(BACKUP_VALUE);
  });
});
