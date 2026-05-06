import { UsernameInput } from './components/UsernameInput'
import { ChoiceButtons } from './components/ChoiceButtons'
import { ResultCard } from './components/ResultCard'
import { Scoreboard } from './components/Scoreboard'
import { useApp } from './useApp'

export default function App() {
  const {
    username,
    setUsername,
    result,
    playLoading,
    playError,
    scoreboard,
    boardLoading,
    boardError,
    handleChoice,
    handleReset,
    fetchScoreboard,
  } = useApp()

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Rock Paper Scissors Lizard Spock</h1>
      </header>

      <div className="app-grid">
        <div className="app-left">
          <div className="card">
            <p className="card-title">Player</p>
            <UsernameInput username={username} onChange={setUsername} />
          </div>

          <div className="card">
            <p className="card-title">Make Your Move</p>
            <ChoiceButtons
              disabled={!username.trim()}
              loading={playLoading}
              onChoice={handleChoice}
            />
            {!username.trim() && (
              <p className="choices-hint">Enter a username above to start playing.</p>
            )}
          </div>
        </div>

        <div className="app-right">
          {playLoading && (
            <div className="loading-overlay">
              <span className="spinner" />
              Waiting for the computer...
            </div>
          )}

          {!playLoading && playError && (
            <div className="error-banner">
              <span className="error-icon">⚠</span>
              <span>{playError}</span>
            </div>
          )}

          {!playLoading && result && (
            <ResultCard result={result} />
          )}

          {!playLoading && !result && !playError && (
            <div className="result-placeholder">
              Make a move to see your result
            </div>
          )}
        </div>
      </div>

      <div className="app-bottom">
        <Scoreboard
          entries={scoreboard}
          loading={boardLoading}
          error={boardError}
          onReset={handleReset}
          onRefresh={fetchScoreboard}
        />
      </div>
    </div>
  )
}
