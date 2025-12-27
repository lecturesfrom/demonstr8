import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface ActionButtonProps {
  onClick?: () => void
  isLoading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  isLoading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  disabled = false,
  className = '',
  children
}) => {
  const baseClasses = 'px-4 py-2 rounded-sm transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses = {
    primary: 'bg-dw-accent hover:bg-dw-accent/90 text-white',
    secondary: 'bg-transparent border border-dw-accent text-dw-accent hover:bg-dw-accent/10',
    danger: 'border border-dw-alert text-dw-alert hover:bg-dw-alert/10'
  }

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClasses}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner
            size="small"
            color={variant === 'primary' ? 'white' : variant === 'danger' ? 'alert' : 'accent'}
          />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}