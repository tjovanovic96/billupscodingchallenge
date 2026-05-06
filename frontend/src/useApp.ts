import { useState, useEffect, useCallback } from 'react'
import { play, getScoreboard, resetScoreboard } from './api'
import type { PlayResult, ScoreboardEntry } from './types'

export interface UseAppReturn {
  username: string
  setUsername: (v: string) => void
  result: PlayResult | null
  playLoading: boolean
  playError: string | null
  scoreboard: ScoreboardEntry[]
  boardLoading: boolean
  boardError: string | null
  handleChoice: (choiceId: number) => Promise<void>
  handleReset: () => Promise<void>
  fetchScoreboard: () => Promise<void>
}

export function useApp(): UseAppReturn {
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

  return {
    username,
    setUsername,
    result,
    playLoading,
    playError,
    scoreboard,
    boardLoading,
    boardError,
    handleChoice,
    handleReset,
    fetchScoreboard,
  }
}
