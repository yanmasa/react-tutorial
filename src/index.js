import React from 'react'; /* reactの読み込み */
import ReactDOM from 'react-dom'; /* react-domの読み込み */
import './index.css'; /* index.cssの読み込み */

function Square(props) {
  return (
    <button
      className={'square' + (props.causedWin ? ' caused-win' : '')}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, causedWin) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        causedWin={causedWin}
      />
    );
  }

  render() {
    const rows = [0, 1, 2];
    const cols = [0, 1, 2];
    return (
      <div>
        {rows.map(row => {
          return (
            <div
              className="board-row"
              key={row}
            >
              {cols.map(col => {
                const cell = row * 3 + col;
                const causedWin = this.props.causedWinCells.includes(cell);
                return this.renderSquare(cell, causedWin);
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: {
            col: null,
            row: null,
          },
        }
      ],
      stepNumber: 0,
      isAscendingOrder: true,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winInfo = calculateWinner(squares);
    if (winInfo.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: {
            col: i % 3,
            row: Math.trunc(i / 3),
          },
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  reverseHistoryOrder() {
    this.setState({
      isAscendingOrder: !this.state.isAscendingOrder,
    });
  }

  render() {
    // 逆順の場合はthis.state.history配列のコピーを反転させる
    // これにより、this.state.historyはつねに昇順のデータを保持し続ける
    const history = this.state.isAscendingOrder ? this.state.history : this.state.history.slice().reverse();
    // 現在選択されているアイテムのインデックスを逆順の場合に反転させる
    const currentStepNumber = this.state.isAscendingOrder ? this.state.stepNumber : history.length - 1 - this.state.stepNumber;
    const current = history[currentStepNumber];
    const winInfo = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      // 逆順の場合はインデックスを反転させる
      const moveIndex = this.state.isAscendingOrder ? move : history.length - 1 - move;
      const desc = moveIndex ?
        'Go to move #' + moveIndex + '(' + step.location.col + ', ' + step.location.row + ')' :
        'Go to game start';
      return (
        <li key={moveIndex}>
          <button
            onClick={() => this.jumpTo(moveIndex)}
            className={move === currentStepNumber ? 'text-bold' : ''}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winInfo.winner) {
      status = "Winner: " + winInfo.winner;
    } else if (!current.squares.includes(null)){
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            causedWinCells={winInfo.causedWinCells}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.reverseHistoryOrder()}>Reverse history order</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        causedWinCells: lines[i],
      };
    }
  }
  return {
    winner: null,
    causedWinCells: [],
  };
}