import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'white' | 'accent' | 'alert' | 'muted'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'accent',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  const colorClasses = {
    white: 'border-white/30 border-t-white',
    accent: 'border-dw-accent/30 border-t-dw-accent',
    alert: 'border-dw-alert/30 border-t-dw-alert',
    muted: 'border-dw-muted/30 border-t-dw-muted'
  }

  return (
    <span
      className={`inline-block ${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
      aria-label="Loading"
    />
  )
}