import {CommandHandler} from '../chat_resolver';
import {lookupCommandHandler} from '_common/chat/command_handlers/lookup_command_handler';

async function lookupHandler(): Promise<CommandHandler> {
  return lookupCommandHandler([
    {
      name: 'Ice Knife',
      desc: 'throw an ince knife',
      page: 'ee pc 19',
      range: '60 feet',
      components: 'S, M',
      material: 'A drop of water or piece of ice.',
      ritual: 'no',
      duration: 'Instantaneous',
      concentration: 'no',
      castingTime: '1 action',
      level: '1st-level',
      school: 'Conjuration',
      class: 'Druid, Sorcerer, Wizard',
    },
  ]);
}

test('non-existent spell should fail', async (done) => {
  const handler = await lookupHandler();

  const result = await handler('how long will you abuse our patience');
  expect(result.header).toContain('not found');
  done();
});

test('find spell', async (done) => {
  const handler = await lookupHandler();

  const result = await handler('ice knife');
  expect(result.header).toContain('Spell found');
  done();
});
