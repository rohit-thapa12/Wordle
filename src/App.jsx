/**
 * App.jsx — Root component and central state manager for the Wordle clone.
 *
 * All game state lives here (single source of truth):
 *   - solutionWord:  the hidden 5-letter target, chosen randomly on mount.
 *   - currentGuess:  the string being typed by the player (0–5 chars).
 *   - pastGuesses:   array of previously submitted guess strings.
 *   - gameStatus:    'IN_PROGRESS' | 'WON' | 'LOST'.
 *   - toast:         brief message shown to the player (errors, etc.).
 *   - shakingRow:    index of the row currently playing the shake animation.
 *
 * Keyboard letter statuses are **derived** (not stored) from pastGuesses
 * and solutionWord to avoid redundant state and keep things in sync.
 *
 * Physical keyboard input is handled via a `keydown` listener attached
 * to `window` inside a useEffect. The handler is wrapped in useCallback
 * to maintain a stable reference and avoid stale-closure bugs.
 */
import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import { evaluateGuess } from './utils/evaluateGuess';
import SOLUTION_WORDS, { isValidGuess } from './data/words';
import './App.css';

/** Pick a random word from the word list. */
function getRandomWord() {
  return SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)];
}

export default function App() {
  // ---- Core game state ----

  /**
   * Lazy initializer: the function passed to useState runs only on the
   * initial render, so the solution word is chosen once and does not
   * change on re-renders.
   */
  const [solutionWord, setSolutionWord] = useState(() => getRandomWord());

  const [currentGuess, setCurrentGuess] = useState('');
  const [pastGuesses, setPastGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('IN_PROGRESS'); // 'IN_PROGRESS' | 'WON' | 'LOST'

  // ---- UI state ----
  const [toast, setToast] = useState(null);       // { message, id } or null
  const [shakingRow, setShakingRow] = useState(null); // row index or null

  // Log the solution to the console for debugging (remove in production)
  useEffect(() => {
    console.log('%c[DEBUG] Solution: ' + solutionWord, 'color: #538d4e; font-weight: bold;');
  }, [solutionWord]);

  // ---- Derived state: keyboard letter statuses ----

  /**
   * Compute the best status for every letter that has been guessed.
   * Priority: correct > present > absent (a key never downgrades).
   *
   * This is derived on every render from pastGuesses + solutionWord,
   * which keeps it automatically in sync without extra state management.
   */
  const letterStatuses = React.useMemo(() => {
    const statuses = {};
    const priority = { absent: 0, present: 1, correct: 2 };

    pastGuesses.forEach((guess) => {
      const result = evaluateGuess(guess, solutionWord);
      for (let i = 0; i < 5; i++) {
        const letter = guess[i];
        const newStatus = result[i];
        const currentPriority = priority[statuses[letter]] ?? -1;
        const newPriority = priority[newStatus] ?? -1;

        // Only upgrade — never downgrade a letter's status
        if (newPriority > currentPriority) {
          statuses[letter] = newStatus;
        }
      }
    });

    return statuses;
  }, [pastGuesses, solutionWord]);

  // ---- Toast helper ----

  /**
   * Show a brief message at the top of the screen.
   * Each toast auto-hides after 1.5 seconds.
   */
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 1500);
  }, []);

  // ---- Shake helper ----

  /** Trigger a shake animation on the active row. */
  const triggerShake = useCallback(() => {
    setShakingRow(pastGuesses.length);
    setTimeout(() => setShakingRow(null), 500);
  }, [pastGuesses.length]);

  // ---- Core input handler ----

  /**
   * handleKeyInput processes a single key press — whether from the
   * physical keyboard or the on-screen keyboard.
   *
   * @param {string} key – 'A'-'Z', 'ENTER', or 'BACKSPACE'
   */
  const handleKeyInput = useCallback(
    (key) => {
      // Block all input once the game is over
      if (gameStatus !== 'IN_PROGRESS') return;

      if (key === 'BACKSPACE') {
        // Remove the last typed letter
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (key === 'ENTER') {
        // Must have exactly 5 letters to submit
        if (currentGuess.length !== 5) {
          showToast('Not enough letters');
          triggerShake();
          return;
        }

        // Validate the guess against the full word list (solutions + valid guesses)
        if (!isValidGuess(currentGuess)) {
          showToast('Not in word list');
          triggerShake();
          return;
        }

        // --- Submit the guess ---
        const newPastGuesses = [...pastGuesses, currentGuess];
        setPastGuesses(newPastGuesses);
        setCurrentGuess('');

        // Check win/loss conditions
        if (currentGuess === solutionWord) {
          setGameStatus('WON');
        } else if (newPastGuesses.length >= 6) {
          setGameStatus('LOST');
        }
        return;
      }

      // Otherwise it's a letter key: add it if the guess isn't full
      if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameStatus, currentGuess, pastGuesses, solutionWord, showToast, triggerShake]
  );

  // ---- Physical keyboard listener ----

  /**
   * handleKeyDown bridges DOM keydown events to our game logic.
   *
   * Important implementation details:
   *   - Wrapped in useCallback so we have a stable function reference
   *     for the useEffect cleanup to remove the correct listener.
   *   - Ignores events with Ctrl, Meta, or Alt modifiers so the user
   *     can still use browser shortcuts (Ctrl+R, etc.).
   *   - Maps 'Enter' → 'ENTER', 'Backspace' → 'BACKSPACE', and single
   *     letters to their uppercase form.
   */
  const handleKeyDown = useCallback(
    (e) => {
      // Don't interfere with browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        handleKeyInput('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyInput('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key.toUpperCase());
      }
    },
    [handleKeyInput]
  );

  /**
   * Attach / detach the keydown listener.
   *
   * The dependency array includes handleKeyDown, which changes when
   * the game state changes (because it closes over handleKeyInput).
   * On each change, the old listener is removed and a new one with
   * the latest state is attached — this prevents stale closures.
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove the listener when the component unmounts
    // or when handleKeyDown changes (before attaching the new one).
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // ---- Play Again handler ----

  /**
   * Reset all state to start a fresh game with a new random word.
   * Called by the Modal's "Play Again" button.
   */
  const handlePlayAgain = useCallback(() => {
    setSolutionWord(getRandomWord());
    setCurrentGuess('');
    setPastGuesses([]);
    setGameStatus('IN_PROGRESS');
    setToast(null);
    setShakingRow(null);
  }, []);

  // ---- Render ----

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Wordle</h1>
      </header>

      {/* Toast messages (errors, etc.) */}
      <div className="toast-container">
        {toast && (
          <div className="toast" key={toast.id}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Game board: 6 rows × 5 tiles */}
      <GameBoard
        pastGuesses={pastGuesses}
        currentGuess={currentGuess}
        solutionWord={solutionWord}
        shakingRow={shakingRow}
      />

      {/* On-screen keyboard */}
      <Keyboard
        onKeyPress={handleKeyInput}
        letterStatuses={letterStatuses}
      />

      {/* Win/Loss modal */}
      <Modal
        gameStatus={gameStatus}
        solutionWord={solutionWord}
        numGuesses={pastGuesses.length}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
