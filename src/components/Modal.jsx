/**
 * Modal.jsx — Game-over overlay dialog.
 *
 * Props:
 *   gameStatus   (string)   – 'WON' or 'LOST'.
 *   solutionWord (string)   – The target word (shown on loss).
 *   numGuesses   (number)   – How many guesses the player used (shown on win).
 *   onPlayAgain  (function) – Callback to reset the game state.
 *
 * Displays:
 *   - On WON: congratulatory message with the number of guesses used.
 *   - On LOST: reveals the solution word the player missed.
 *   - A "Play Again" button that triggers a full state reset.
 *
 * The overlay traps interaction — clicking outside the modal box does nothing,
 * so the user must press the button to continue.
 */
import React from 'react';

export default function Modal({ gameStatus, solutionWord, numGuesses, onPlayAgain }) {
  // Don't render anything if the game is still in progress
  if (gameStatus === 'IN_PROGRESS') return null;

  const isWin = gameStatus === 'WON';

  return (
    <div className="modal-overlay">
      <div className="modal">
        {isWin ? (
          <>
            <h2>🎉 You Won!</h2>
            <p>
              Congratulations! You found the word in{' '}
              <strong>{numGuesses}</strong> guess{numGuesses !== 1 ? 'es' : ''}.
            </p>
          </>
        ) : (
          <>
            <h2>😞 Game Over</h2>
            <p>
              The word was: <span className="solution-word">{solutionWord}</span>
            </p>
          </>
        )}
        <button onClick={onPlayAgain}>Play Again</button>
      </div>
    </div>
  );
}
