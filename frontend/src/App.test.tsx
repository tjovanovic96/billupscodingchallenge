import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import App from './App'
import type { UseAppReturn } from './useApp'

vi.mock('./useApp')

import { useApp } from './useApp'

const mockUseApp = vi.mocked(useApp)

const CHOICES = [
  { id: 1, name: 'Rock',     emoji: '🪨' },
  { id: 2, name: 'Paper',    emoji: '📄' },
  { id: 3, name: 'Scissors', emoji: '✂️' },
  { id: 4, name: 'Lizard',   emoji: '🦎' },
  { id: 5, name: 'Spock',    emoji: '🖖' },
]

const CHOICE_MAP = Object.fromEntries(CHOICES.map((c) => [c.id, c]))

const PLAY_WIN = {
  username: 'alice',
  results: 'Win' as const,
  player: 1,
  computer: 3,
}

const SCOREBOARD_ROW = {
  id: 1,
  username: 'alice',
  playerChoiceId: 1,
  computerChoiceId: 3,
  result: 'Win',
  playedAtUtc: '2024-01-15T10:00:00Z',
}

function makeHookState(overrides: Partial<UseAppReturn> = {}): UseAppReturn {
  return {
    choices: CHOICES,
    choiceMap: CHOICE_MAP,
    choicesLoading: false,
    choicesError: null,
    username: '',
    setUsername: vi.fn(),
    result: null,
    playLoading: false,
    playError: null,
    scoreboard: [],
    boardLoading: false,
    boardError: null,
    handleChoice: vi.fn(),
    handleReset: vi.fn(),
    fetchScoreboard: vi.fn(),
    ...overrides,
  }
}

describe('App', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue(makeHookState())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders the page title', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /rock paper scissors lizard spock/i })).toBeInTheDocument()
    })

    it('shows the username input', () => {
      render(<App />)
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    })

    it('shows all 5 choice buttons', () => {
      render(<App />)
      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeInTheDocument()
      }
    })

    it('shows the result placeholder', () => {
      render(<App />)
      expect(screen.getByText(/make a move to see your result/i)).toBeInTheDocument()
    })

    it('shows the scoreboard heading', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /scoreboard/i })).toBeInTheDocument()
    })
  })

  describe('username behavior', () => {
    it('disables choice buttons when username is empty', () => {
      render(<App />)
      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeDisabled()
      }
    })

    it('enables choice buttons when username is set', () => {
      mockUseApp.mockReturnValue(makeHookState({ username: 'alice' }))
      render(<App />)
      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeEnabled()
      }
    })
  })

  describe('play states', () => {
    it('shows loading overlay when playLoading is true', () => {
      mockUseApp.mockReturnValue(makeHookState({ playLoading: true }))
      render(<App />)
      expect(screen.getByText(/waiting for the computer/i)).toBeInTheDocument()
    })

    it('shows error banner when playError is set', () => {
      mockUseApp.mockReturnValue(makeHookState({ playError: 'Something went wrong' }))
      render(<App />)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('shows result card when result is set', () => {
      mockUseApp.mockReturnValue(makeHookState({ result: PLAY_WIN }))
      render(<App />)
      expect(screen.getByText(/you win/i)).toBeInTheDocument()
    })

    it('hides the placeholder when a result is set', () => {
      mockUseApp.mockReturnValue(makeHookState({ result: PLAY_WIN }))
      render(<App />)
      expect(screen.queryByText(/make a move to see your result/i)).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls handleChoice with the correct id when a choice button is clicked', async () => {
      const handleChoice = vi.fn()
      mockUseApp.mockReturnValue(makeHookState({ username: 'alice', handleChoice }))
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))
      expect(handleChoice).toHaveBeenCalledWith(1)
    })

    it('calls handleReset when the reset button is clicked', async () => {
      const handleReset = vi.fn()
      mockUseApp.mockReturnValue(makeHookState({ scoreboard: [SCOREBOARD_ROW], handleReset }))
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: /reset scoreboard/i }))
      expect(handleReset).toHaveBeenCalled()
    })

    it('calls fetchScoreboard when the refresh button is clicked', async () => {
      const fetchScoreboard = vi.fn()
      mockUseApp.mockReturnValue(makeHookState({ fetchScoreboard }))
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: /refresh scoreboard/i }))
      expect(fetchScoreboard).toHaveBeenCalled()
    })
  })
})
