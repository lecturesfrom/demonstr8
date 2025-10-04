/**
 * ProcessingBadge Component
 *
 * What: Shows "⏳ Processing" or "✓ Ready" based on playback_id status
 * Why: Prevents hosts from playing tracks that aren't ready yet
 * How it helps users: Host sees clear status, won't click Play on unprocessed tracks
 */

interface ProcessingBadgeProps {
  playback_id: string | null
}

export function ProcessingBadge({ playback_id }: ProcessingBadgeProps) {
  if (!playback_id) {
    return (
      <span className="text-sm text-dw-muted uppercase tracking-wider inline-block">
        ⏳ Processing
      </span>
    )
  }

  return (
    <span className="text-sm text-dw-success uppercase tracking-wider inline-block">
      ✓ Ready
    </span>
  )
}
