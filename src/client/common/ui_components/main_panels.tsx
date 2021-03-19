import React from 'react';
import ReactDOM from 'react-dom';

export const BOARD_TOOLS_NAVBAR: JSX.Element = (
  <div>
    <div className="topnav">
      <div
        className="inactive"
        onClick={() => {
          window.location.href = './gameBoard';
        }}
      >
        Game Board
      </div>
      <div
        className="active"
        onClick={() => {
          window.location.href = './boardTools';
        }}
      >
        Board Tools
      </div>
    </div>
    <br />
  </div>
);

export const GAME_BOARD_NAVBAR: JSX.Element = (
  <div className="topnav">
    <div
      className="active"
      onClick={() => {
        window.location.href = './gameBoard';
      }}
    >
      Game Board
    </div>
    <div
      className="inactive"
      onClick={() => {
        window.location.href = './boardTools';
      }}
    >
      Board Tools
    </div>
  </div>
);

export class MainPanels extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <div id="panel1" className="split left">
          <div id="mainBoard" style={{position: 'relative'}}></div>
          <div id="rightClickMenuStub"></div>
          <div
            id="addNewIconFormStub"
            style={{zIndex: 30, display: 'top'}}
          ></div>
        </div>
        <div id="panel2" className="split right">
          <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
            <div id="navbarStub"></div>
            <div id="sidePanelContent"></div>
          </div>
        </div>
      </div>
    );
  }
}

export namespace MainPanels {
  export function setupWithNavbar(navbar: JSX.Element): void {
    ReactDOM.render(<MainPanels />, document.querySelector('#contentStub'));
    ReactDOM.render(navbar, document.querySelector('#navbarStub'));
  }
}
