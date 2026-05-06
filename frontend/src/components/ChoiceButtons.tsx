export const CHOICES = [
  { id: 1, name: 'Rock',     emoji: '🪨' },
  { id: 2, name: 'Paper',    emoji: '📄' },
  { id: 3, name: 'Scissors', emoji: '✂️' },
  { id: 4, name: 'Lizard',   emoji: '🦎' },
  { id: 5, name: 'Spock',    emoji: '🖖' },
] as const

interface ChoiceButtonsProps {
  disabled: boolean
  loading: boolean
  onChoice: (id: number) => void
}

export function ChoiceButtons({ disabled, loading, onChoice }: ChoiceButtonsProps) {
  return (
    <div className="choices-grid">
      {CHOICES.map((choice) => (
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
