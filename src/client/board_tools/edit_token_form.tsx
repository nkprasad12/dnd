import React, {useState} from 'react';
import {
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
import {SubmitDialogView} from '_client/common/ui_components/submit_dialog';
import {ModelHandler} from '_client/game_board/controller/model_handler';
import {TokenModel} from '_client/game_board/model/token_model';
import {checkDefined} from '_common/preconditions';

export interface EditTokenFormProps {
  visible: boolean;
  setVisibility: (show: boolean) => any;
  token: TokenModel;
  modelHandler: ModelHandler;
}

export function EditTokenForm(props: EditTokenFormProps) {
  const [name, setName] = useState<string | undefined>(props.token.inner.name);
  const [size, setSize] = useState<number | undefined>(props.token.inner.size);
  const [speed, setSpeed] = useState<number | undefined>(
    props.token.inner.speed
  );
  const [sheetLink, setSheetLink] = useState<string | undefined>(
    props.token.inner.sheetData?.sheetId
  );

  return (
    <SubmitDialogView
      visible={props.visible}
      setVisibility={props.setVisibility}
      title="Edit Token"
      showSubmit={(name && size && speed) !== undefined}
      onSubmit={() =>
        onSubmit(
          checkDefined(name),
          checkDefined(speed),
          checkDefined(size),
          props,
          sheetLink
        )
      }
      submitText="Create"
    >
      <TextInputField
        label="Token Name"
        inputCallback={setName}
        defaultValue={props.token.inner.name}
      />
      <NumberInputField
        label="Size (in tiles)"
        inputCallback={setSize}
        defaultValue={props.token.inner.size}
      />
      <NumberInputField
        label="Speed (tiles per move)"
        inputCallback={setSpeed}
        defaultValue={props.token.inner.speed}
      />
      <TextInputField
        label="Character Sheet Link (Optional)"
        inputCallback={setSheetLink}
        defaultValue={props.token.inner.sheetData?.sheetId}
      />
    </SubmitDialogView>
  );
}

function onSubmit(
  name: string,
  speed: number,
  size: number,
  props: EditTokenFormProps,
  sheetLink?: string
) {
  console.log('TODO: Use sheet link. Got: ' + sheetLink);
  const collisions = props.modelHandler.collisionIds(
    props.token.inner.location,
    size
  );
  if (
    collisions.length > 1 ||
    (collisions.length === 1 && collisions[0] !== props.token.inner.id)
  ) {
    // TODO: Show the user this error.
    console.log('Token would collide, ignoring request');
    return;
  }

  const mutation = {
    inner: {id: props.token.inner.id, name: name, speed: speed, size: size},
  };
  const edited = TokenModel.merge(props.token, mutation);
  console.log('Edited token: ' + JSON.stringify(edited));

  const model = props.modelHandler.getModel();
  let index: number | undefined = undefined;
  for (let i = 0; i < model.tokens.length; i++) {
    if (model.tokens[i].inner.id === edited.inner.id) {
      index = i;
      break;
    }
  }
  if (index === undefined) {
    console.log('Could not find token to update!');
    return;
  }
  props.modelHandler.applyLocalDiff({
    tokenDiffs: [edited],
  });
}
