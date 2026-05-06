import type { ScoreboardEntry } from '../types'
import { CHOICES } from './ChoiceButtons'

const CHOICE_NAME = Object.fromEntries(CHOICES.map((c) => [c.id, c.name])) as Record<number, string>

function formatDate(utcString: string): string {
  return new Date(utcString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ScoreboardProps {
  entries: ScoreboardEntry[]
  loading: boolean
  error: string | null
  onReset: () => void
  onRefresh: () => void
}

export function Scoreboard({ entries, loading, error, onReset, onRefresh }: ScoreboardProps) {
  return (
    <div className="scoreboard-card">
      <div className="scoreboard-header">
        <h2 className="scoreboard-title">Scoreboard</h2>
        <div className="scoreboard-actions">
          <button
            className="refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh scoreboard"
            title="Refresh"
          >
            {loading ? '...' : '↻ Refresh'}
          </button>
          <button
            className="reset-btn"
            onClick={onReset}
            disabled={loading}
            aria-label="Reset scoreboard"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {loading && entries.length === 0 ? (
        <div className="loading-overlay">
          <span className="spinner" />
          Loading scoreboard...
        </div>
      ) : entries.length === 0 ? (
        <p className="empty-state">No games played yet. Make your first move!</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Player</th>
                <th>Computer</th>
                <th>Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.username}</td>
                  <td>{CHOICE_NAME[entry.playerChoiceId] ?? entry.playerChoiceId}</td>
                  <td>{CHOICE_NAME[entry.computerChoiceId] ?? entry.computerChoiceId}</td>
                  <td>
                    <span className={`badge badge-${entry.result.toLowerCase()}`}>
                      {entry.result}
                    </span>
                  </td>
                  <td>{formatDate(entry.playedAtUtc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
