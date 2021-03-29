import React from 'react';
import {
  handleImageUpload,
  HTMLInputEvent,
  LoadedImage,
} from '_client/utils/image_utils';

export interface TextInputFieldProps {
  label: string;
  labelColor?: string;
  inputCallback: (input: string | undefined) => any;
  defaultValue?: string;
}

export function TextInputField(props: TextInputFieldProps) {
  props.inputCallback(props.defaultValue);
  return (
    <div>
      <label color={props.labelColor}>{props.label}</label>
      <br />
      <input
        type="text"
        defaultValue={props.defaultValue}
        onChange={(event) => {
          const value = event.target.value;
          props.inputCallback(value.length === 0 ? undefined : value);
        }}
      />
      <br />
      <br />
    </div>
  );
}

export interface NumberInputFieldProps {
  label: string;
  labelColor?: string;
  inputCallback: (input: number | undefined) => any;
  defaultValue?: number;
  min?: number;
  max?: number;
}

export function NumberInputField(props: NumberInputFieldProps) {
  props.inputCallback(props.defaultValue);
  return (
    <div>
      <label color={props.labelColor}>{props.label}</label>
      <br />
      <input
        type="number"
        defaultValue={props.defaultValue}
        min={props.min}
        max={props.max}
        onChange={(event) => {
          const value = event.target.value;
          props.inputCallback(value.length === 0 ? undefined : parseInt(value));
        }}
      />
      <br />
      <br />
    </div>
  );
}

export interface ImageInputFieldProps {
  label: string;
  labelColor?: string;
  inputCallback: (input: LoadedImage | undefined) => any;
}

export function ImageInputField(props: ImageInputFieldProps) {
  return (
    <div>
      <label color={props.labelColor}>{props.label}</label>
      <br />
      <input
        type="file"
        role="imageUpload"
        accept="image/*"
        onChange={(event) => {
          handleImageUpload(event.nativeEvent as HTMLInputEvent)
            .then((image) => props.inputCallback(image))
            .catch(() => {
              console.log('Image upload failed.');
              props.inputCallback(undefined);
            });
        }}
      />
      <br />
      <br />
    </div>
  );
}
