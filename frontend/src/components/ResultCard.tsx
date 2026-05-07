import type { ChoiceWithEmoji, PlayResult, GameOutcome } from '../types'

const OUTCOME_CONFIG: Record<GameOutcome, { label: string }> = {
  Win:  { label: 'You Win' },
  Lose: { label: 'You Lose' },
  Tie:  { label: 'Tie' },
}

interface ResultCardProps {
  result: PlayResult
  choiceMap: Record<number, ChoiceWithEmoji>
}

export function ResultCard({ result, choiceMap }: ResultCardProps) {
  const player   = choiceMap[result.player]
  const computer = choiceMap[result.computer]
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
