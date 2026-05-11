'use client'

import { Chat } from "./Chat"
import { cn } from "@/utils/tw"
import { useEffect, useState } from 'react'

const CHARS = ['▓', '▒', '░']
const LENGTH = 8

function generateRandomText() {
    return Array.from(
      { length: LENGTH },
      () => CHARS[Math.floor(Math.random() * CHARS.length)],
    ).join('')
  }

const Redacted = () => {
  const [text, setText] = useState(generateRandomText())
  const [chatActive, setChatActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setText(generateRandomText())
    }, 500)

    return () => clearInterval(interval)
  }, [])
  return (
    <button
      className={cn('add-focus-text font-mono', {
        'cursor-auto': chatActive,
        'cursor-help': !chatActive,
      })}
      style={{ position: "relative" }}
      onClick={() => setChatActive(true)}
    >
      <Chat active={chatActive} setActive={() => setChatActive(false)} />
      {text}
    </button>
  )
}

export default Redacted