/**
 * Tile.jsx — A single letter tile on the game board.
 *
 * Props:
 *   letter (string)  – The letter to display ('' if empty).
 *   status (string)  – One of: 'correct', 'present', 'absent', 'filled', 'empty'.
 *                      Determines the CSS class (and therefore the color).
 *   delay  (number)  – Animation delay in ms for the flip animation,
 *                      used to stagger reveals across a row.
 *
 * The component applies:
 *   - 'filled' + pop animation when the user types a letter (before submit).
 *   - 'flip' + the evaluated color class after a row is submitted.
 *   - 'empty' when the tile has no letter and no status.
 */
import React from 'react';

export default function Tile({ letter, status, delay = 0 }) {
  // Build the CSS class string.
  // - Base class is always "tile".
  // - The status class controls the tile's background color.
  // - The "flip" class triggers the flip-and-reveal animation for
  //   evaluated tiles (correct / present / absent).
  const isEvaluated = ['correct', 'present', 'absent'].includes(status);

  const className = [
    'tile',
    status,              // e.g. 'correct', 'filled', 'empty'
    isEvaluated && 'flip' // add flip only for revealed tiles
  ]
    .filter(Boolean)
    .join(' ');

  // Stagger the flip animation across the 5 tiles in a row
  const style = isEvaluated ? { animationDelay: `${delay}ms` } : {};

  return (
    <div className={className} style={style}>
      {letter}
    </div>
  );
}
