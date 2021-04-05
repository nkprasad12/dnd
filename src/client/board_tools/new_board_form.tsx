import React, {useEffect, useState} from 'react';
import {
  ImageInputField,
  NumberInputField,
  TextInputField,
} from '_client/common/ui_components/input_fields';
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

  const submitDisplay =
    inputValues.image && inputValues.name && inputValues.tileSize
      ? 'block'
      : 'none';

  return (
    <div style={{zIndex: 30, display: 'block'}} className="modal">
      <div className="modal-content">
        <div
          className="close"
          dangerouslySetInnerHTML={{__html: '&times;'}}
          onClick={() => props.setVisibility(false)}
        />
        <p>New board attributes</p>
        <InputFields onInputChange={setInputValues} />
        <button
          className="btn-success"
          style={{display: submitDisplay}}
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
