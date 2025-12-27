import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueueItem } from '@/components/QueueItem'

describe('QueueItem Component', () => {
  const mockSubmission = {
    id: 'test-id',
    track_title: 'Test Track',
    artist_name: 'Test Artist',
    file_url: 'https://storage.supabase.co/audio-submissions/test-file.mp3',
    status: 'pending' as const,
  }

  it('should render track information', () => {
    render(<QueueItem submission={mockSubmission} />)

    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('should show Approve button for pending submissions when host', () => {
    const onApprove = vi.fn()

    render(
      <QueueItem
        submission={mockSubmission}
        onApprove={onApprove}
        isHost={true}
      />
    )

    const approveButton = screen.getByText('Approve')
    expect(approveButton).toBeInTheDocument()

    fireEvent.click(approveButton)
    expect(onApprove).toHaveBeenCalledWith('test-id')
  })

  it('should show Play and Skip buttons for approved submissions', () => {
    const onPlay = vi.fn()
    const onSkip = vi.fn()

    render(
      <QueueItem
        submission={{ ...mockSubmission, status: 'approved' }}
        onPlay={onPlay}
        onSkip={onSkip}
        isHost={true}
      />
    )

    expect(screen.getByText('Play')).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('should disable Play button when no file_url', () => {
    render(
      <QueueItem
        submission={{
          ...mockSubmission,
          status: 'approved',
          file_url: null,
        }}
        isHost={true}
      />
    )

    const playButton = screen.getByText('Play')
    expect(playButton).toBeDisabled()
  })

  it('should show playing state styling for playing tracks', () => {
    const { container } = render(
      <QueueItem
        submission={{ ...mockSubmission, status: 'playing' }}
      />
    )

    // Check that playing status applies accent styling
    expect(container.firstChild).toHaveClass('bg-dw-accent/10')
  })

  it('should not show action buttons when not host', () => {
    render(
      <QueueItem
        submission={mockSubmission}
        isHost={false}
        onApprove={vi.fn()}
      />
    )

    expect(screen.queryByText('Approve')).not.toBeInTheDocument()
  })

  it('should apply correct styling based on status', () => {
    const { rerender, container } = render(
      <QueueItem submission={mockSubmission} />
    )

    // Pending status
    expect(container.firstChild).toHaveClass('border-border-dw-muted')

    // Approved status
    rerender(
      <QueueItem
        submission={{ ...mockSubmission, status: 'approved' }}
      />
    )
    expect(container.firstChild).toHaveClass('border-dw-success')

    // Playing status
    rerender(
      <QueueItem
        submission={{ ...mockSubmission, status: 'playing' }}
      />
    )
    expect(container.firstChild).toHaveClass('bg-dw-accent/10')
  })

  it('should show loading state when approving', () => {
    render(
      <QueueItem
        submission={mockSubmission}
        isHost={true}
        isLoading={true}
        onApprove={vi.fn()}
      />
    )

    expect(screen.getByText('Approving...')).toBeInTheDocument()
  })
})