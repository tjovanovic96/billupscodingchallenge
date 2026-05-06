import type { PlayResult, GameOutcome } from '../types'
import { CHOICES } from './ChoiceButtons'

const CHOICE_MAP = Object.fromEntries(CHOICES.map((c) => [c.id, c])) as Record<
  number,
  { id: number; name: string; emoji: string }
>

const OUTCOME_CONFIG: Record<GameOutcome, { label: string }> = {
  Win:  { label: 'You Win' },
  Lose: { label: 'You Lose' },
  Tie:  { label: "Tie" },
}

interface ResultCardProps {
  result: PlayResult
}

export function ResultCard({ result }: ResultCardProps) {
  const player   = CHOICE_MAP[result.player]
  const computer = CHOICE_MAP[result.computer]
  const outcome  = OUTCOME_CONFIG[result.results]

  return (
    <div className={`result-card result-${result.results.toLowerCase()}`}>
      <h2 className="result-outcome">{outcome.label}</h2>

      <div className="result-choices">
        <div className="result-choice">
          <span className="result-emoji" aria-label={player.name}>{player.emoji}</span>
          <span className="result-label">You</span>
          <span className="result-choice-name">{player.name}</span>
        </div>

        <span className="result-vs" aria-hidden="true">vs</span>

        <div className="result-choice">
          <span className="result-emoji" aria-label={computer.name}>{computer.emoji}</span>
          <span className="result-label">Computer</span>
          <span className="result-choice-name">{computer.name}</span>
        </div>
      </div>
    </div>
  )
}
