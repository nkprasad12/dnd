import React, {FunctionComponent} from 'react';

interface Props {
  /** Visibility of the entire dialog. */
  visible: boolean;
  /** Sets visibility of the entire dialog. */
  setVisibility: (show: boolean) => any;
  /** Title shown on top of the dialog. */
  title?: string;
  /** Visibility of the submit button. */
  showSubmit: boolean;
  /** Logic to execute when submit is clicked. */
  onSubmit: () => any;
  /** Text to show in the submit button. */
  submitText?: string;
}

const View: FunctionComponent<Props> = (props) => {
  if (!props.visible) {
    return null;
  }

  return (
    <div
      style={{zIndex: 30, display: 'block'}}
      className="modal"
      data-testid="dialog"
    >
      <div className="modal-content">
        <div
          className="close"
          dangerouslySetInnerHTML={{__html: '&times;'}}
          onClick={() => props.setVisibility(false)}
          data-testid="close"
        />
        <p>{props.title}</p>
        <br />
        {props.children}
        <button
          className="btn-success"
          style={{display: props.showSubmit ? 'block' : 'none'}}
          onClick={() => {
            props.setVisibility(false);
            props.onSubmit();
          }}
        >
          {props.submitText ?? 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export {Props as SubmitDialogProps};
export {View as SubmitDialogView};
