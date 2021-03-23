import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {Navbar, NavbarOption} from '_client/entrypoints/main/navbar';

it('initializes with correctly selected option', () => {
  const setSelected = jest.fn((option: NavbarOption) => option) as any;
  render(<Navbar selected={NavbarOption.MAIN} setSelected={setSelected} />);

  expect(screen.getByText(NavbarOption.MAIN)!.className).toBe('active');
  expect(screen.getByText(NavbarOption.EDITOR)!.className).toBe('inactive');
});

it('invoked callback on selected item', () => {
  const setSelected = jest.fn((option: NavbarOption) => option) as any;
  render(<Navbar selected={NavbarOption.MAIN} setSelected={setSelected} />);
  act(() => {
    fireEvent.click(screen.getByText(NavbarOption.EDITOR)!, {
      button: 0,
    });
  });

  expect(setSelected).toHaveBeenCalledTimes(1);
  expect(setSelected).toHaveBeenCalledWith(NavbarOption.EDITOR);
});
