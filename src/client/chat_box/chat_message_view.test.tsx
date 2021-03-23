import React from 'react';
import {render, screen} from '@testing-library/react';
import {ChatMessageView} from './chat_message_view';

const NITIN_WAS_HERE = 'Nitin was here';
const GOOD_NEWS_EVERYONE = 'Good news, everyone!';

test('Message with body only renders body', () => {
  render(<ChatMessageView message={{body: NITIN_WAS_HERE}} />);
  expect(screen.getByText(NITIN_WAS_HERE)).toBeDefined();
});

test('Message with header and body shows both', () => {
  const message = {body: NITIN_WAS_HERE, header: GOOD_NEWS_EVERYONE};
  render(<ChatMessageView message={message} />);

  expect(screen.getByText(NITIN_WAS_HERE)).toBeDefined();
  expect(screen.getByText(GOOD_NEWS_EVERYONE)).toBeDefined();
});
