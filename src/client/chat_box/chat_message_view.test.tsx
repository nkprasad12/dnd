import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {act} from 'react-dom/test-utils';

import {ChatMessageView} from './chat_message_view';

let container: HTMLDivElement | null = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (container !== null) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
});

const NITIN_WAS_HERE = 'Nitin was here';
const GOOD_NEWS_EVERYONE = 'Good news, everyone!';

test('Message with body only renders body', () => {
  act(() => {
    render(<ChatMessageView message={{body: NITIN_WAS_HERE}} />, container);
  });
  expect(container?.textContent).toBe(NITIN_WAS_HERE);
});

test('Message with header and body shows both', () => {
  const message = {body: NITIN_WAS_HERE, header: GOOD_NEWS_EVERYONE};
  act(() => {
    render(<ChatMessageView message={message} />, container);
  });
  expect(container?.textContent).toContain(NITIN_WAS_HERE);
  expect(container?.textContent).toContain(GOOD_NEWS_EVERYONE);
});
