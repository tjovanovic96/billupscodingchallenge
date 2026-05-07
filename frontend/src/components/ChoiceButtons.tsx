import type { ChoiceWithEmoji } from '../types'

interface ChoiceButtonsProps {
  choices: ChoiceWithEmoji[]
  disabled: boolean
  loading: boolean
  onChoice: (id: number) => void
}

export function ChoiceButtons({ choices, disabled, loading, onChoice }: ChoiceButtonsProps) {
  return (
    <div className="choices-grid">
      {choices.map((choice) => (
        <button
          key={choice.id}
          className="choice-btn"
          disabled={disabled || loading}
          onClick={() => onChoice(choice.id)}
          title={choice.name}
          aria-label={`Play ${choice.name}`}
        >
          <span className="choice-emoji" aria-hidden="true">{choice.emoji}</span>
          <span className="choice-name">{choice.name}</span>
        </button>
      ))}
    </div>
  )
}
