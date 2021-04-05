import React, {useEffect, useState} from 'react';
import {
  DropdownSelectorView,
  SelectorItem,
} from '_client/common/ui_components/dropdown';
import {
  ImageInputField,
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
import {ModelHandler} from '_client/game_board/controller/model_handler';
import {TokenModel} from '_client/game_board/model/token_model';
import {RemoteCache} from '_client/game_board/remote/remote_cache';
import {LoadedImage, loadImage} from '_client/utils/image_utils';
import {TokenData} from '_common/board/token_data';
import {Location} from '_common/coordinates';
import {checkDefined} from '_common/preconditions';

export interface NewTokenFormProps {
  visible: boolean;
  setVisibility: (show: boolean) => any;
  modelHandler: ModelHandler;
  tile: Location;
}

export function NewTokenForm(props: NewTokenFormProps) {
  const [name, setName] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<number | undefined>(undefined);
  const [speed, setSpeed] = useState<number | undefined>(undefined);
  const [icon, setIcon] = useState<LoadedImage | undefined>(undefined);
  const [tokenDropdownModel, setTokenDropdownModel] = useState<
    SelectorItem<TokenData>[]
  >([]);
  const [tokenTemplate, setTokenTemplate] = useState<TokenData | undefined>(
    undefined
  );

  useEffect(() => {
    if (props.visible) {
      RemoteCache.get()
        .getAllTokens()
        .then((data) =>
          setTokenDropdownModel(
            data.map((token) =>
              SelectorItem.create<TokenData>(token.id, token.name, false, token)
            )
          )
        );
    }
  }, [props.visible]);

  if (!props.visible) {
    return null;
  }

  async function onSubmit() {
    const token = tokenTemplate
      ? new TokenModel(
          {
            id: tokenTemplate.id,
            name: checkDefined(name),
            speed: checkDefined(speed),
            imageSource: tokenTemplate.imageSource,
            size: checkDefined(size),
            location: props.tile,
            sheetData: null,
          },
          (await loadImage(tokenTemplate.imageSource)).image,
          false
        )
      : TokenModel.create(
          checkDefined(name),
          checkDefined(icon),
          checkDefined(size),
          props.tile,
          false,
          checkDefined(speed)
        );

    props.modelHandler.addNewToken(token);

    props.setVisibility(false);
    setTokenTemplate(undefined);
    setName(undefined);
    setSize(undefined);
    setSpeed(undefined);
    setIcon(undefined);
  }

  const allFieldsFilled =
    name !== undefined &&
    size !== undefined &&
    speed !== undefined &&
    (icon !== undefined || tokenTemplate !== undefined);

  return (
    <div style={{zIndex: 30, display: 'block'}} className="modal">
      <div className="modal-content">
        <div
          className="close"
          dangerouslySetInnerHTML={{__html: '&times;'}}
          onClick={() => props.setVisibility(false)}
        />
        <p>Token attributes</p>
        <DropdownSelectorView<TokenData>
          label="Existing Tokens"
          model={tokenDropdownModel}
          clickListener={(selectedItem, newModel) => {
            const token = selectedItem.data;
            setTokenTemplate(token);
            setName(token.name);
            setSpeed(token.speed);
            setSize(1);
            setTokenDropdownModel(newModel);
          }}
        />
        <TextInputField
          label="Token Name"
          inputCallback={setName}
          defaultValue={tokenTemplate?.name}
        />
        <NumberInputField
          label="Size (in tiles)"
          inputCallback={setSize}
          defaultValue={1}
        />
        <NumberInputField
          label="Speed (in tiles per mode)"
          inputCallback={setSpeed}
          defaultValue={tokenTemplate?.speed ?? 6}
        />
        {tokenTemplate === undefined && (
          <ImageInputField label="Icon" inputCallback={setIcon} />
        )}
        <button
          className="btn-success"
          style={{display: allFieldsFilled ? 'block' : 'none'}}
          onClick={() => {
            props.setVisibility(false);
            onSubmit();
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
}