import React, {useState} from 'react';
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
  const [formComplete, setFormComplete] = useState(false);
  if (!props.visible) {
    return null;
  }

  function onInputChange(token: TokenModel | undefined): void {
    const tokenDefined = token !== undefined;
    setFormComplete(tokenDefined);
    if (tokenDefined) {
      onSubmit(token!);
    }
  }

  // TODO: Move this from the UI.
  // We should have modelHandler register callbacks for new tokens
  // that will get unregistered on unmount.
  function onSubmit(token: TokenModel) {
    props.setVisibility(false);
    console.log('NewTokenForm onNewToken: ' + token.inner.id);
    const model = props.modelHandler.getModel();
    let addedToken = false;
    for (let i = 0; i < model.tokens.length; i++) {
      if (model.tokens[i].inner.id !== token.inner.id) {
        continue;
      }
      props.modelHandler.applyLocalDiff({tokenDiffs: [model.tokens[i]]});
      addedToken = true;
      break;
    }
    if (!addedToken) {
      props.modelHandler.applyLocalDiff({
        inner: {
          newTokens: [token.inner],
          id: model.inner.id,
        },
      });
    }
  }

  return (
    <div style={{zIndex: 30, display: 'top'}} className="modal">
      <div className="modal-content">
        <div
          className="close"
          dangerouslySetInnerHTML={{__html: '&times;'}}
          onClick={() => props.setVisibility(false)}
        />
        <div>Enter token attributes</div>
        <InputFields
          tile={props.tile}
          onAllInputs={(token) => onInputChange(token)}
        />
        <button
          className="btn-success"
          style={{display: formComplete ? 'block' : 'none'}}
          onClick={() => {
            props.setVisibility(false);
            console.log('TODO: add submit logic');
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
  tokenId?: string;
  image?: LoadedImage;
  onAllInputs: (token: TokenModel | undefined) => any;
}

function InputFields(props: InputFieldProps) {
  const [name, setName] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<number | undefined>(undefined);
  const [speed, setSpeed] = useState<number | undefined>(undefined);
  const [icon, setIcon] = useState<LoadedImage | undefined>(props.image);

  if (
    name !== undefined &&
    size !== undefined &&
    speed !== undefined &&
    icon !== undefined
  ) {
    const token =
      props.tokenId === undefined
        ? TokenModel.create(name, icon, size, props.tile, false, speed)
        : new TokenModel(
            {
              id: props.tokenId,
              name: name,
              imageSource: icon.source,
              size: size,
              location: props.tile,
              speed: speed,
              sheetData: null,
            },
            icon.image,
            false
          );
    props.onAllInputs(token);
  } else {
    props.onAllInputs(undefined);
  }

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
