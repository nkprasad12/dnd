import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {
  ImageInputField,
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
import {act} from 'react-dom/test-utils';
import {LoadedImage} from '_client/utils/image_utils';
import {FakeImage} from '_client/utils/fake_image';
import {FakeFileReader} from '_client/utils/fake_file_reader';

const LABEL = 'I think labels are restrictive';

const realFetch = global.fetch;
const savePath = 'whatever.png';

beforeAll(() => {
  // @ts-ignore
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({path: savePath}),
    })
  );
  FakeImage.invokeBeforeAll(false);
  FakeFileReader.invokeBeforeAll();
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
  FakeFileReader.setOnLoadEvent({target: {result: 'imagebytes'}} as any);
});

afterEach(() => {
  FakeFileReader.invokeAfterEach();
});

afterAll(() => {
  global.fetch = realFetch;
  FakeImage.invokeAfterAll();
  FakeFileReader.invokeAfterAll();
});

describe('TextInputField', () => {
  it('initializes label with correct text', () => {
    render(<TextInputField label={LABEL} inputCallback={() => {}} />);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  it('initializes field with correct default', () => {
    const value = 'Alfred the Great';
    render(
      <TextInputField
        label={LABEL}
        defaultValue={value}
        inputCallback={() => {}}
      />
    );
    const element = screen.getByRole('textbox') as HTMLInputElement;

    expect(element.value).toBe(value);
  });

  it('initializes field with correct input type', () => {
    const value = 'Alfred the Great';
    render(
      <TextInputField
        label={LABEL}
        defaultValue={value}
        inputCallback={() => {}}
      />
    );
    const element = screen.getByRole('textbox') as HTMLInputElement;

    expect(element.type).toBe('text');
  });

  it('updates field and callback on change', () => {
    const initialValue = 'Alfred the Great';
    const newValue = 'William was here';
    const callback = jest.fn();
    render(
      <TextInputField
        label={LABEL}
        defaultValue={initialValue}
        inputCallback={callback}
      />
    );
    const element = screen.getByRole('textbox') as HTMLInputElement;
    act(() => {
      fireEvent.change(element, {target: {value: newValue}});
    });

    expect(element.value).toBe(newValue);
    expect(callback).toHaveBeenCalledWith(newValue);
  });

  it('updates field and callback to undefined on empty', () => {
    const initialValue = 'Alfred the Great';
    const callback = jest.fn();
    render(
      <TextInputField
        label={LABEL}
        defaultValue={initialValue}
        inputCallback={callback}
      />
    );
    const element = screen.getByRole('textbox') as HTMLInputElement;
    act(() => {
      fireEvent.change(element, {target: {value: ''}});
    });

    expect(element.value).toBe('');
    expect(callback).toHaveBeenCalledWith(undefined);
  });
});

describe('NumberInputField', () => {
  it('initializes label with correct text', () => {
    render(<NumberInputField label={LABEL} inputCallback={() => {}} />);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  it('initializes field with correct default', () => {
    const value = 57;
    render(
      <NumberInputField
        label={LABEL}
        defaultValue={value}
        inputCallback={() => {}}
      />
    );
    const element = screen.getByRole('spinbutton') as HTMLInputElement;

    expect(parseInt(element.value)).toBe(value);
  });

  it('initializes field with correct input type', () => {
    render(<NumberInputField label={LABEL} inputCallback={() => {}} />);
    const element = screen.getByRole('spinbutton') as HTMLInputElement;

    expect(element.type).toBe('number');
  });

  it('updates field and callback on change', () => {
    const newValue = 57;
    const callback = jest.fn();
    render(<NumberInputField label={LABEL} inputCallback={callback} />);
    const element = screen.getByRole('spinbutton') as HTMLInputElement;
    act(() => {
      fireEvent.change(element, {target: {value: newValue}});
    });

    expect(parseInt(element.value)).toBe(newValue);
    expect(callback).toHaveBeenCalledWith(newValue);
  });

  it('updates callback to undefined on empty', () => {
    const callback = jest.fn();
    render(<NumberInputField label={LABEL} inputCallback={callback} />);
    const element = screen.getByRole('spinbutton') as HTMLInputElement;
    act(() => {
      fireEvent.change(element, {target: {value: 57}});
    });
    callback.mockClear();

    act(() => {
      fireEvent.change(element, {target: {value: ''}});
    });

    expect(element.value).toBe('');
    expect(callback).toHaveBeenLastCalledWith(undefined);
  });
});

describe('ImageInputField', () => {
  type MaybeImage = LoadedImage | undefined;
  type ImagePromise = Promise<MaybeImage>;

  function resolveOnCallback(
    callback: jest.Mock<MaybeImage, any>
  ): ImagePromise {
    callback.mockClear();
    return new Promise((resolve) => {
      setInterval(() => {
        if (callback.mock.calls.length > 0) {
          resolve(callback.mock.calls[0]);
        }
      }, 10);
    });
  }

  it('initializes label with correct text', () => {
    render(<ImageInputField label={LABEL} inputCallback={() => {}} />);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  it('updates field and callback on failed upload', async (done) => {
    const callback: jest.Mock<MaybeImage, any> = jest.fn();
    render(<ImageInputField label={LABEL} inputCallback={callback} />);
    const element = screen.getByRole('imageUpload') as HTMLInputElement;
    const imagePromise = resolveOnCallback(callback);

    act(() => {
      fireEvent.change(element, {target: {files: []}});
    });
    await imagePromise;

    expect(callback).toHaveBeenCalledWith(undefined);
    done();
  });

  it('updates field and callback on successful upload', async (done) => {
    const callback: jest.Mock<MaybeImage, any> = jest.fn();
    render(<ImageInputField label={LABEL} inputCallback={callback} />);
    const element = screen.getByRole('imageUpload') as HTMLInputElement;
    const imagePromise = resolveOnCallback(callback);

    act(() => {
      fireEvent.change(element, {target: {files: [{type: 'image/png'}]}});
    });
    await imagePromise;
    const image = callback.mock.calls[0];

    expect(callback).toHaveBeenCalledTimes(1);
    expect(image).toBeDefined();
    done();
  });
});
