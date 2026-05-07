import { useState, useEffect, useCallback, useMemo } from 'react'
import { getChoices, play, getScoreboard, resetScoreboard } from './api'
import type { ChoiceWithEmoji, PlayResult, ScoreboardEntry } from './types'

const EMOJI_MAP: Record<number, string> = {
  1: '🪨',
  2: '📄',
  3: '✂️',
  4: '🦎',
  5: '🖖',
}

export interface UseAppReturn {
  choices: ChoiceWithEmoji[]
  choiceMap: Record<number, ChoiceWithEmoji>
  choicesLoading: boolean
  choicesError: string | null
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
  const [choices, setChoices] = useState<ChoiceWithEmoji[]>([])
  const [choicesLoading, setChoicesLoading] = useState(false)
  const [choicesError, setChoicesError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [result, setResult] = useState<PlayResult | null>(null)
  const [playLoading, setPlayLoading] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [boardLoading, setBoardLoading] = useState(false)
  const [boardError, setBoardError] = useState<string | null>(null)

  useEffect(() => {
    setChoicesLoading(true)
    getChoices()
      .then((data) => setChoices(data.map((c) => ({ ...c, emoji: EMOJI_MAP[c.id] ?? '?' }))))
      .catch((err) => setChoicesError(err instanceof Error ? err.message : 'Failed to load choices'))
      .finally(() => setChoicesLoading(false))
  }, [])

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

  const choiceMap = useMemo(
    () => Object.fromEntries(choices.map((c) => [c.id, c])),
    [choices]
  )

  return {
    choices,
    choiceMap,
    choicesLoading,
    choicesError,
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
