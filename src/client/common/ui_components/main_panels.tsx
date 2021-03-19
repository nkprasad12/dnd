import React from 'react';
import ReactDOM from 'react-dom';

export const BOARD_TOOLS_NAVBAR: JSX.Element = (
  <div>
    <div className="topnav">
      <a href="./gameBoard">Game Board</a>
      <a className="active" href="./boardTools">
        Board Tools
      </a>
    </div>
    <br />
  </div>
);

export const GAME_BOARD_NAVBAR: JSX.Element = (
  <div className="topnav">
    <a className="active" href="./gameBoard">
      Game Board
    </a>
    <a href="./boardTools">Board Tools</a>
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
