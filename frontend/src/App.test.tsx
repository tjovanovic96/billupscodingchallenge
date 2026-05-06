import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// ── Test data ───────────────────────────────────────────────

const PLAY_WIN = {
  username: 'alice',
  results: 'Win' as const,
  player: 1,   // Rock
  computer: 3, // Scissors
}

const SCOREBOARD_ROW = {
  id: 1,
  username: 'alice',
  playerChoiceId: 1,
  computerChoiceId: 3,
  result: 'Win',
  playedAtUtc: '2024-01-15T10:00:00Z',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function setupFetch({
  scoreboardData = [] as unknown[],
  playResult = PLAY_WIN as unknown,
  playStatus = 200,
}: {
  scoreboardData?: unknown[]
  playResult?: unknown
  playStatus?: number
} = {}) {
  const mock = vi.fn().mockImplementation(async (input: unknown, init?: RequestInit) => {
    const url = String(input)
    const method = (init?.method ?? 'GET').toUpperCase()

    if (url.endsWith('/play') && method === 'POST') {
      if (playStatus >= 400) return new Response(String(playResult), { status: playStatus })
      return jsonResponse(playResult)
    }

    if (url.endsWith('/scoreboard') && method === 'DELETE') {
      return new Response(null, { status: 204 })
    }

    if (url.endsWith('/scoreboard')) {
      return jsonResponse(scoreboardData)
    }

    return new Response('Not found', { status: 404 })
  })

  vi.stubGlobal('fetch', mock)
  return mock
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial render', () => {
    it('renders without crashing', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
    })

    it('shows the username input', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    })

    it('shows all 5 choice buttons', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeInTheDocument()
      }
    })

    it('shows the result area placeholder', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
      expect(screen.getByText(/make a move to see your result/i)).toBeInTheDocument()
    })

    it('shows the scoreboard section', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
      expect(screen.getByRole('heading', { name: /scoreboard/i })).toBeInTheDocument()
    })
  })

  describe('username behavior', () => {
    it('disables choice buttons when username is empty', async () => {
      setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)
      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeDisabled()
      }
    })

    it('enables choice buttons after entering a username', async () => {
      setupFetch()
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')

      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeEnabled()
      }
    })
  })

  describe('playing a round', () => {
    it('calls POST /play with the correct username and player choice', async () => {
      const fetchMock = setupFetch()
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))
      await screen.findByText(/you win/i)

      expect(fetchMock).toHaveBeenCalledWith(
        '/play',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'alice', player: 1 }),
        }),
      )
    })

    it('shows loading state while the request is pending', async () => {
      let resolvePlay!: (r: Response) => void
      const pendingPlay = new Promise<Response>(resolve => { resolvePlay = resolve })

      vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: unknown, init?: RequestInit) => {
        if (String(input).endsWith('/play') && init?.method?.toUpperCase() === 'POST') {
          return pendingPlay
        }
        return jsonResponse([])
      }))

      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))

      expect(screen.getByText(/waiting for the computer/i)).toBeInTheDocument()

      resolvePlay(jsonResponse(PLAY_WIN))
      await screen.findByText(/you win/i)
    })

    it('displays the result after a successful play', async () => {
      setupFetch()
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))

      await screen.findByText(/you win/i)
    })

    it('refreshes the scoreboard after playing', async () => {
      const fetchMock = setupFetch()
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      const boardCallsBefore = fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/scoreboard'),
      ).length

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))
      await screen.findByText(/you win/i)

      const boardCallsAfter = fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith('/scoreboard'),
      ).length

      expect(boardCallsAfter).toBeGreaterThan(boardCallsBefore)
    })
  })

  describe('scoreboard', () => {
    it('calls GET /scoreboard on initial load', async () => {
      const fetchMock = setupFetch()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      expect(fetchMock).toHaveBeenCalledWith('/scoreboard')
    })

    it('displays scoreboard entries returned from the API', async () => {
      setupFetch({ scoreboardData: [SCOREBOARD_ROW] })
      render(<App />)

      await screen.findByText('alice')
      expect(screen.getByText('alice')).toBeInTheDocument()
    })

    it('calls DELETE /scoreboard when reset is clicked', async () => {
      const fetchMock = setupFetch({ scoreboardData: [SCOREBOARD_ROW] })
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText('alice')

      await user.click(screen.getByRole('button', { name: /reset scoreboard/i }))
      await screen.findByText(/no games played yet/i)

      expect(fetchMock).toHaveBeenCalledWith(
        '/scoreboard',
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('clears the scoreboard after reset', async () => {
      setupFetch({ scoreboardData: [SCOREBOARD_ROW] })
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText('alice')

      await user.click(screen.getByRole('button', { name: /reset scoreboard/i }))
      await screen.findByText(/no games played yet/i)
    })
  })

  describe('error handling', () => {
    it('shows an error message when the play API call fails', async () => {
      setupFetch({ playResult: 'Internal Server Error', playStatus: 500 })
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))

      await screen.findByText(/internal server error/i)
    })

    it('keeps the UI usable after a play error', async () => {
      setupFetch({ playResult: 'Service Unavailable', playStatus: 503 })
      const user = userEvent.setup()
      render(<App />)
      await screen.findByText(/no games played yet/i)

      await user.type(screen.getByLabelText(/username/i), 'alice')
      await user.click(screen.getByRole('button', { name: 'Play Rock' }))
      await screen.findByText(/service unavailable/i)

      for (const name of ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']) {
        expect(screen.getByRole('button', { name: `Play ${name}` })).toBeEnabled()
      }
    })
  })
})
