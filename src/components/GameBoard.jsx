/**
 * GameBoard.jsx — The 6×5 grid of tiles.
 *
 * Props:
 *   pastGuesses       (string[]) – Array of previously submitted guess strings.
 *   currentGuess      (string)   – The guess currently being typed.
 *   solutionWord      (string)   – The target word (needed to evaluate past guesses).
 *   shakingRow        (number|null) – Index of the row currently shaking (invalid input).
 *
 * Renders exactly 6 rows:
 *   - Rows 0..(pastGuesses.length-1) show submitted guesses with evaluated colors.
 *   - Row at index pastGuesses.length shows the current guess being typed.
 *   - Remaining rows are empty.
 *
 * The board itself does not hold any state — it is a pure display component
 * that derives everything from props passed down by App.
 */
import React from 'react';
import Row from './Row';
import { evaluateGuess } from '../utils/evaluateGuess';

export default function GameBoard({ pastGuesses, currentGuess, solutionWord, shakingRow }) {
  const rows = [];

  for (let i = 0; i < 6; i++) {
    if (i < pastGuesses.length) {
      // --- Completed row: show the submitted guess with its evaluated statuses ---
      const statuses = evaluateGuess(pastGuesses[i], solutionWord);
      rows.push(
        <Row key={i} letters={pastGuesses[i]} statuses={statuses} />
      );
    } else if (i === pastGuesses.length) {
      // --- Active row: show the letters currently being typed ---
      rows.push(
        <Row
          key={i}
          letters={currentGuess}
          isShaking={shakingRow === i}
        />
      );
    } else {
      // --- Future row: empty ---
      rows.push(<Row key={i} />);
    }
  }

  return <div className="game-board">{rows}</div>;
}
