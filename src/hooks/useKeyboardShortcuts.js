import { useEffect, useCallback } from 'react'

export const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyPress = useCallback(
    (event) => {
      const key = event.key.toLowerCase()
      const ctrlKey = event.ctrlKey || event.metaKey
      const altKey = event.altKey
      const shiftKey = event.shiftKey

      shortcuts.forEach(({ keys, action, preventDefault = true }) => {
        const [mainKey, ...modifiers] = keys.split('+').reverse()

        const requiredCtrl = modifiers.includes('ctrl')
        const requiredAlt = modifiers.includes('alt')
        const requiredShift = modifiers.includes('shift')

        if (
          key === mainKey.toLowerCase() &&
          ctrlKey === requiredCtrl &&
          altKey === requiredAlt &&
          shiftKey === requiredShift
        ) {
          if (preventDefault) {
            event.preventDefault()
          }
          action(event)
        }
      })
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
}
