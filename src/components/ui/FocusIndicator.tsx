"use client"

import { useEffect, useState } from "react"

export function FocusIndicator() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleMouseDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  useEffect(() => {
    if (isKeyboardUser) {
      document.body.classList.add("keyboard-user")
    } else {
      document.body.classList.remove("keyboard-user")
    }
  }, [isKeyboardUser])

  return null
}
