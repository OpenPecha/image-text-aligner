import { useRef, useEffect } from 'react'
import { Check, Copy, Eye, EyeOff} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface TextPanelProps {
  noisyText: string
  correctedText: string
  onTextChange: (text: string) => void
  isLoading?: boolean
  readOnly?: boolean
}

export function TextPanel({
  noisyText,
  correctedText,
  onTextChange,
  isLoading,
  readOnly = false,
}: TextPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [correctedText])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(correctedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden rounded-md">

  <div className="flex-1 relative">
    <textarea
      ref={textareaRef}
      value={correctedText}
      onChange={(e) => onTextChange(e.target.value)}
      readOnly={readOnly}
      placeholder={
        readOnly ? 'No corrected text generated.' : 'Begin typing or editing...'
      }
      className={cn(
        'h-full w-full resize-none bg-transparent p-5 font-mono text-sm leading-7',
        'text-foreground placeholder:text-muted-foreground/50',
        'focus:outline-none focus:ring-0',
        readOnly && 'cursor-default opacity-80'
      )}
      spellCheck={false}
    />
  </div>
  {showOriginal && (
    <div className="shrink-0 border-b border-border bg-muted/40 p-4 transition-all animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Eye className="h-3 w-3" />
        Original Transcription 
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed opacity-90">
        {noisyText}
      </p>
    </div>
  )}
  <div className="flex shrink-0 items-center justify-between border-t border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    
    {/* Left: Metadata (Counts) */}
    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
      <span>
        {correctedText.length} <span className="opacity-50">chars</span>
      </span>
      <span className="w-px h-3 bg-border" /> {/* Divider */}
      <span>
        {correctedText.split(/\s+/).filter(Boolean).length} <span className="opacity-50">words</span>
      </span>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-1">
      {/* Toggle Original View */}
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOriginal(!showOriginal)}
          className={cn(
            "h-8 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
            showOriginal && "bg-muted text-foreground"
          )}
        >
          {showOriginal ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Hide Source</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Show Source</span>
            </>
          )}
        </Button>
      )}

      {/* Divider for visual separation of groups */}
      <div className="mx-1 h-4 w-px bg-border" />

      {/* Copy Action */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground transition-all hover:bg-muted"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500 scale-110" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  </div>
</div>
  )
}

