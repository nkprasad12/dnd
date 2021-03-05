import {isChatMessage} from '_common/chat/chat_model';


test('isChatMessage on invalid message returns false', () => {
  expect(isChatMessage({header: 'Neymar'})).toBe(false);
});

test('isChatMessage on valid message returns true', () => {
  expect(isChatMessage({body: 'Now if we\'re talking body'})).toBe(true);
});
