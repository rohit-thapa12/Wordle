/**
 * Row.jsx — A single row of 5 tiles on the game board.
 *
 * Props:
 *   letters    (string)   – The letters for this row (0–5 characters).
 *   statuses   (string[]) – Array of 5 status strings if the row has been
 *                           evaluated, or null/undefined for the current/empty row.
 *   isShaking  (boolean)  – Whether to apply the shake animation (invalid submit).
 *
 * Behavior:
 *   - If `statuses` is provided, each tile gets its evaluated color class.
 *   - Otherwise, tiles with a letter get 'filled' and tiles without get 'empty'.
 *   - The flip animation is staggered: each tile's delay = index × 300 ms.
 */
import React from 'react';
import Tile from './Tile';

export default function Row({ letters = '', statuses = null, isShaking = false }) {
  // Always render exactly 5 tiles per row
  const tiles = [];

  for (let i = 0; i < 5; i++) {
    const letter = letters[i] || '';
    let status;

    if (statuses) {
      // This row has been submitted and evaluated
      status = statuses[i];
    } else if (letter) {
      // Active row: letter typed but not yet submitted
      status = 'filled';
    } else {
      // No letter — empty placeholder tile
      status = 'empty';
    }

    tiles.push(
      <Tile
        key={i}
        letter={letter}
        status={status}
        delay={statuses ? i * 300 : 0}  // stagger flip animation by 300ms per tile
      />
    );
  }

  // Apply 'shake' class when the user submits an invalid guess
  const className = `row${isShaking ? ' shake' : ''}`;

  return <div className={className}>{tiles}</div>;
}
