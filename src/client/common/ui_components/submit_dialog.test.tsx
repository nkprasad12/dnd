import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {SubmitDialogView} from '_client/common/ui_components/submit_dialog';

it('renders nothing when not visible', () => {
  render(
    <SubmitDialogView
      visible={false}
      setVisibility={() => {}}
      showSubmit={false}
      onSubmit={() => {}}
    />
  );
  expect(screen.queryByTestId('dialog')).toBeNull();
});

it('renders dialog with button when requested', () => {
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={() => {}}
      showSubmit={false}
      onSubmit={() => {}}
    />
  );
  expect(screen.queryByTestId('dialog')).not.toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

it('renders title when requested', () => {
  const title = 'That is the question';
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={() => {}}
      showSubmit={false}
      title={title}
      onSubmit={() => {}}
    />
  );
  expect(screen.queryByText(title)).not.toBeNull();
});

it('renders default submit button when requested', () => {
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={() => {}}
      showSubmit={true}
      onSubmit={() => {}}
    />
  );
  expect(screen.queryByRole('button')).not.toBeNull();
});

it('renders custom submit button when requested', () => {
  const submitLabel = 'To be or not to be';
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={() => {}}
      showSubmit={true}
      onSubmit={() => {}}
      submitText={submitLabel}
    />
  );
  expect(screen.queryByText(submitLabel)).not.toBeNull();
});

it('notifies onSubmit when submit clicked', () => {
  const onSubmit = jest.fn();
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={() => {}}
      showSubmit={true}
      onSubmit={onSubmit}
    />
  );
  act(() => {
    fireEvent.click(screen.queryByRole('button')!, {});
  });

  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it('hides dialog when submit clicked', () => {
  const setVisibility = jest.fn();
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={setVisibility}
      showSubmit={true}
      onSubmit={() => {}}
    />
  );
  act(() => {
    fireEvent.click(screen.queryByRole('button')!, {});
  });

  expect(setVisibility).toHaveBeenCalledTimes(1);
  expect(setVisibility).toHaveBeenCalledWith(false);
});

it('hides dialog when close clicked', () => {
  const setVisibility = jest.fn();
  render(
    <SubmitDialogView
      visible={true}
      setVisibility={setVisibility}
      showSubmit={true}
      onSubmit={() => {}}
    />
  );
  act(() => {
    fireEvent.click(screen.queryByTestId('close')!, {});
  });

  expect(setVisibility).toHaveBeenCalledTimes(1);
  expect(setVisibility).toHaveBeenCalledWith(false);
});
