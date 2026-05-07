import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApp } from './useApp'

vi.mock('./api')

import { play, getScoreboard, resetScoreboard, getChoices } from './api'

const mockPlay = vi.mocked(play)
const mockGetScoreboard = vi.mocked(getScoreboard)
const mockResetScoreboard = vi.mocked(resetScoreboard)
const mockGetChoices = vi.mocked(getChoices)

const API_CHOICES = [
  { id: 1, name: 'Rock' },
  { id: 2, name: 'Paper' },
  { id: 3, name: 'Scissors' },
  { id: 4, name: 'Lizard' },
  { id: 5, name: 'Spock' },
]

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

describe('useApp', () => {
  beforeEach(() => {
    mockGetChoices.mockResolvedValue(API_CHOICES)
    mockGetScoreboard.mockResolvedValue([])
    mockPlay.mockResolvedValue(PLAY_WIN)
    mockResetScoreboard.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('choices fetch', () => {
    it('calls getChoices on mount', async () => {
      renderHook(() => useApp())
      await waitFor(() => expect(mockGetChoices).toHaveBeenCalledTimes(1))
    })

    it('populates choices with emoji merged from local map', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.choices).toHaveLength(5))
      expect(result.current.choices).toEqual([
        { id: 1, name: 'Rock',     emoji: '🪨' },
        { id: 2, name: 'Paper',    emoji: '📄' },
        { id: 3, name: 'Scissors', emoji: '✂️' },
        { id: 4, name: 'Lizard',   emoji: '🦎' },
        { id: 5, name: 'Spock',    emoji: '🖖' },
      ])
    })

    it('builds choiceMap keyed by id from fetched choices', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.choices).toHaveLength(5))
      expect(result.current.choiceMap[1]).toMatchObject({ id: 1, name: 'Rock' })
      expect(result.current.choiceMap[5]).toMatchObject({ id: 5, name: 'Spock' })
    })

    it('sets choicesError when getChoices fails', async () => {
      mockGetChoices.mockRejectedValue(new Error('Failed to load choices'))
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.choicesError).toBe('Failed to load choices'))
    })

    it('sets choicesLoading to false after fetch completes', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.choicesLoading).toBe(false))
    })
  })

  describe('initial fetch', () => {
    it('calls getScoreboard on mount', async () => {
      renderHook(() => useApp())
      await waitFor(() => expect(mockGetScoreboard).toHaveBeenCalledTimes(1))
    })

    it('populates scoreboard with fetched data', async () => {
      mockGetScoreboard.mockResolvedValue([SCOREBOARD_ROW])
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.scoreboard).toEqual([SCOREBOARD_ROW]))
    })

    it('sets boardError when getScoreboard fails', async () => {
      mockGetScoreboard.mockRejectedValue(new Error('Network error'))
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardError).toBe('Network error'))
    })
  })

  describe('handleChoice', () => {
    it('calls play with the current username and choice id', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardLoading).toBe(false))

      act(() => { result.current.setUsername('alice') })
      await act(async () => { await result.current.handleChoice(1) })

      expect(mockPlay).toHaveBeenCalledWith('alice', 1)
    })

    it('sets result after a successful play', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardLoading).toBe(false))

      await act(async () => { await result.current.handleChoice(1) })

      expect(result.current.result).toEqual(PLAY_WIN)
    })

    it('refreshes the scoreboard after a successful play', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(mockGetScoreboard).toHaveBeenCalledTimes(1))

      await act(async () => { await result.current.handleChoice(1) })

      expect(mockGetScoreboard).toHaveBeenCalledTimes(2)
    })

    it('sets playError when play fails', async () => {
      mockPlay.mockRejectedValue(new Error('Service unavailable'))
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardLoading).toBe(false))

      await act(async () => { await result.current.handleChoice(1) })

      expect(result.current.playError).toBe('Service unavailable')
    })
  })

  describe('handleReset', () => {
    it('calls resetScoreboard', async () => {
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardLoading).toBe(false))

      await act(async () => { await result.current.handleReset() })

      expect(mockResetScoreboard).toHaveBeenCalled()
    })

    it('clears scoreboard and result after reset', async () => {
      mockGetScoreboard.mockResolvedValue([SCOREBOARD_ROW])
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.scoreboard).toEqual([SCOREBOARD_ROW]))

      await act(async () => { await result.current.handleChoice(1) })
      expect(result.current.result).toEqual(PLAY_WIN)

      await act(async () => { await result.current.handleReset() })

      expect(result.current.scoreboard).toEqual([])
      expect(result.current.result).toBeNull()
    })

    it('sets boardError when reset fails', async () => {
      mockResetScoreboard.mockRejectedValue(new Error('Reset failed'))
      const { result } = renderHook(() => useApp())
      await waitFor(() => expect(result.current.boardLoading).toBe(false))

      await act(async () => { await result.current.handleReset() })

      expect(result.current.boardError).toBe('Reset failed')
    })
  })
})
