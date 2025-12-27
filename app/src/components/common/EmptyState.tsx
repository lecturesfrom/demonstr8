import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-dw-surface border border-border-dw-muted rounded-sm p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-dw-muted">
          {icon}
        </div>
      )}
      <p className="text-dw-muted text-lg mb-2">
        {title}
      </p>
      {description && (
        <p className="text-dw-text-muted text-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}