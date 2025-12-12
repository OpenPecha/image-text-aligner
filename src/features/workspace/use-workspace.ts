import { useState, useCallback, useEffect } from 'react'
import { useUIStore } from '@/store/use-ui-store'

interface UseWorkspaceOptions {
  initialText?: string
  onTextChange?: (text: string) => void
}

export function useWorkspace({ initialText = '', onTextChange }: UseWorkspaceOptions = {}) {
  const [text, setText] = useState(initialText)
  const [zoom, setZoom] = useState(1)
  const [splitPosition, setSplitPosition] = useState(50) // percentage
  const { setUnsavedChanges, unsavedChanges } = useUIStore()

  // Track if text has changed from initial
  useEffect(() => {
    const hasChanges = text !== initialText
    setUnsavedChanges(hasChanges)
  }, [text, initialText, setUnsavedChanges])

  // Update text when initial text changes (e.g., task loaded)
  useEffect(() => {
    setText(initialText)
  }, [initialText])

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
    onTextChange?.(newText)
  }, [onTextChange])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  const handleSplitChange = useCallback((position: number) => {
    setSplitPosition(Math.max(20, Math.min(80, position)))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus: Zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      }
      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      // Ctrl/Cmd + 0: Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleZoomReset])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unsavedChanges])

  return {
    text,
    setText: handleTextChange,
    zoom,
    setZoom,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomReset: handleZoomReset,
    splitPosition,
    setSplitPosition: handleSplitChange,
    unsavedChanges,
  }
}

