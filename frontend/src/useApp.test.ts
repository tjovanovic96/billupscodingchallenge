import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApp } from './useApp'

vi.mock('./api')

import { play, getScoreboard, resetScoreboard } from './api'

const mockPlay = vi.mocked(play)
const mockGetScoreboard = vi.mocked(getScoreboard)
const mockResetScoreboard = vi.mocked(resetScoreboard)

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
    mockGetScoreboard.mockResolvedValue([])
    mockPlay.mockResolvedValue(PLAY_WIN)
    mockResetScoreboard.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
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
