/**
 * Keyboard.jsx — On-screen QWERTY keyboard.
 *
 * Props:
 *   onKeyPress    (function) – Callback fired when any key is clicked.
 *                              Receives the key value: a letter 'A'-'Z',
 *                              'ENTER', or 'BACKSPACE'.
 *   letterStatuses (object)  – Map of letter → best status so far.
 *                              e.g. { A: 'correct', B: 'absent', ... }
 *                              Used to color the keys green/yellow/gray.
 *
 * Layout:
 *   Row 1: Q W E R T Y U I O P
 *   Row 2:  A S D F G H J K L
 *   Row 3: ENTER Z X C V B N M ⌫
 *
 * The keyboard uses onMouseDown + preventDefault to avoid stealing focus
 * from the page and to prevent double-firing alongside the physical
 * keyboard's keydown handler.
 */
import React from 'react';

// QWERTY layout split into three rows
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function Keyboard({ onKeyPress, letterStatuses }) {
  /**
   * We use onMouseDown instead of onClick so we can call preventDefault()
   * to stop the button from stealing focus. This also prevents the browser's
   * default behavior which could cause double-firing with physical keyboard events.
   */
  const handleMouseDown = (e, key) => {
    e.preventDefault(); // prevent focus shift and double-fire
    onKeyPress(key);
  };

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
          {row.map((key) => {
            // Determine the CSS class for this key based on its best status
            const status = letterStatuses[key] || '';
            const isWide = key === 'ENTER' || key === 'BACKSPACE';

            const className = [
              'key',
              status,          // 'correct', 'present', 'absent', or ''
              isWide && 'wide' // wider keys for Enter and Backspace
            ]
              .filter(Boolean)
              .join(' ');

            // Display label: show "⌫" symbol for backspace for a cleaner look
            const label = key === 'BACKSPACE' ? '⌫' : key;

            return (
              <button
                key={key}
                className={className}
                onMouseDown={(e) => handleMouseDown(e, key)}
                tabIndex={-1}       // prevent tab-focus on keyboard buttons
                aria-label={key}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
