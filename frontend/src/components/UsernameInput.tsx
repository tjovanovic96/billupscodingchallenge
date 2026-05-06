const MAX_LENGTH = 50

interface UsernameInputProps {
  username: string
  onChange: (value: string) => void
}

export function UsernameInput({ username, onChange }: UsernameInputProps) {
  return (
    <div className="username-wrapper">
      <label htmlFor="username">Username</label>
      <input
        id="username"
        className="username-input"
        type="text"
        value={username}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your username..."
        maxLength={MAX_LENGTH}
        autoComplete="off"
        spellCheck={false}
      />
      <p className="char-count">{username.length} / {MAX_LENGTH}</p>
    </div>
  )
}
