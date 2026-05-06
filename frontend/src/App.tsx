import { useState, useEffect, useCallback } from 'react'
import { UsernameInput } from './components/UsernameInput'
import { ChoiceButtons } from './components/ChoiceButtons'
import { ResultCard } from './components/ResultCard'
import { Scoreboard } from './components/Scoreboard'
import { play, getScoreboard, resetScoreboard } from './api'
import type { PlayResult, ScoreboardEntry } from './types'

export default function App() {
  const [username, setUsername] = useState('')

  const [result, setResult] = useState<PlayResult | null>(null)
  const [playLoading, setPlayLoading] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)

  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [boardLoading, setBoardLoading] = useState(false)
  const [boardError, setBoardError] = useState<string | null>(null)

  const fetchScoreboard = useCallback(async () => {
    setBoardLoading(true)
    setBoardError(null)
    try {
      const data = await getScoreboard()
      setScoreboard(data)
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : 'Failed to load scoreboard')
    } finally {
      setBoardLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScoreboard()
  }, [fetchScoreboard])

  async function handleChoice(choiceId: number) {
    setPlayLoading(true)
    setPlayError(null)
    try {
      const res = await play(username.trim(), choiceId)
      setResult(res)
      await fetchScoreboard()
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPlayLoading(false)
    }
  }

  async function handleReset() {
    setBoardLoading(true)
    setBoardError(null)
    try {
      await resetScoreboard()
      setScoreboard([])
      setResult(null)
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : 'Failed to reset scoreboard')
    } finally {
      setBoardLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Rock Paper Scissors Lizard Spock</h1>
      </header>

      <div className="app-grid">
        {/* Left: username + choices */}
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

        {/* Right: result */}
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

      {/* Bottom: full-width scoreboard */}
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
