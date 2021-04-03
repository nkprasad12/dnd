import React, {useCallback, useEffect, useState} from 'react';
import {
  ImageInputField,
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
import {ModelHandler} from '_client/game_board/controller/model_handler';
import {TokenModel} from '_client/game_board/model/token_model';
import {LoadedImage} from '_client/utils/image_utils';
import {Location} from '_common/coordinates';

export interface NewTokenFormProps {
  visible: boolean;
  setVisibility: (show: boolean) => any;
  modelHandler: ModelHandler;
  tile: Location;
}

export function NewTokenForm(props: NewTokenFormProps) {
  const [pendingToken, setPendingToken] = useState<TokenModel | null>(null);
  const onFormChange = useCallback((token: TokenModel | undefined) => {
    setPendingToken(token ?? null);
  }, []);
  if (!props.visible) {
    return null;
  }

  function onSubmit(token: TokenModel) {
    props.setVisibility(false);
    props.modelHandler.addNewToken(token);
    setPendingToken(null);
  }

  return (
    <div style={{zIndex: 30, display: 'block'}} className="modal">
      <div className="modal-content">
        <div
          className="close"
          dangerouslySetInnerHTML={{__html: '&times;'}}
          onClick={() => props.setVisibility(false)}
        />
        <div>Enter token attributes</div>
        <InputFields tile={props.tile} onAllInputs={onFormChange} />
        <button
          className="btn-success"
          style={{display: pendingToken ? 'block' : 'none'}}
          onClick={() => {
            props.setVisibility(false);
            onSubmit(pendingToken!);
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
}

interface InputFieldProps {
  tile: Location;
  image?: LoadedImage;
  onAllInputs: (token: TokenModel | undefined) => any;
}

function InputFields(props: InputFieldProps) {
  const [name, setName] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<number | undefined>(undefined);
  const [speed, setSpeed] = useState<number | undefined>(undefined);
  const [icon, setIcon] = useState<LoadedImage | undefined>(props.image);

  const onAllInputs = props.onAllInputs;
  const tile = props.tile;

  useEffect(() => {
    const token =
      name !== undefined &&
      size !== undefined &&
      speed !== undefined &&
      icon !== undefined
        ? TokenModel.create(name, icon, size, tile, false, speed)
        : undefined;
    // Need to do this for the case where we pre-fill from an existing token.
    // : new TokenModel(
    //     {
    //       id: tokenId,
    //       name: name,
    //       imageSource: icon.source,
    //       size: size,
    //       location: tile,
    //       speed: speed,
    //       sheetData: null,
    //     },
    //     icon.image,
    //     false
    //   );
    onAllInputs(token);
  }, [icon, name, onAllInputs, size, speed, tile]);

  return (
    <div>
      <TextInputField label="Token Name" inputCallback={setName} />
      <NumberInputField label="Size (in tiles)" inputCallback={setSize} />
      <NumberInputField
        label="Speed (in tiles per mode)"
        inputCallback={setSpeed}
      />
      {props.image === undefined && (
        <ImageInputField label="Icon" inputCallback={setIcon} />
      )}
    </div>
  );
}
