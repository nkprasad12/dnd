import React, {useEffect, useState} from 'react';
import {
  ImageInputField,
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
import {SubmitDialogView} from '_client/common/ui_components/submit_dialog';
import {BoardModel} from '_client/game_board/model/board_model';
import {LoadedImage} from '_client/utils/image_utils';
import {checkDefined} from '_common/preconditions';

export interface NewBoardFormProps {
  visible: boolean;
  setVisibility: (show: boolean) => any;
  onNewBoard: (board: BoardModel) => any;
}

export function NewBoardForm(props: NewBoardFormProps) {
  const [inputValues, setInputValues] = useState<InputValues>({});
  if (!props.visible) {
    return null;
  }

  function onSubmit() {
    props.setVisibility(false);
    props.onNewBoard(
      BoardModel.createNew(
        checkDefined(inputValues.name),
        checkDefined(inputValues.image),
        checkDefined(inputValues.tileSize)
      )
    );
    setInputValues({});
  }

  const allowSubmit =
    inputValues.image && inputValues.name && inputValues.tileSize;

  return (
    <SubmitDialogView
      visible={props.visible}
      setVisibility={props.setVisibility}
      title="New board attributes"
      showSubmit={allowSubmit === undefined}
      onSubmit={() => onSubmit()}
      submitText="Create"
    >
      <InputFields onInputChange={setInputValues} />
    </SubmitDialogView>
  );
}

interface InputFieldProps {
  onInputChange: (values: InputValues) => any;
}

interface InputValues {
  name?: string;
  tileSize?: number;
  image?: LoadedImage;
}

function InputFields(props: InputFieldProps) {
  const [name, setName] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<number | undefined>(undefined);
  const [image, setImage] = useState<LoadedImage | undefined>(undefined);

  const onInputChange = props.onInputChange;
  useEffect(() => {
    const values: InputValues = {
      name: name,
      tileSize: size,
      image: image,
    };
    onInputChange(values);
  }, [onInputChange, name, size, image]);

  return (
    <div>
      <TextInputField label="Board Name" inputCallback={setName} />
      <NumberInputField label="Tile size (in pixels)" inputCallback={setSize} />
      <ImageInputField label="Background Image" inputCallback={setImage} />
    </div>
  );
}
