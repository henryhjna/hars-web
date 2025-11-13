import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      rounded = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200';

    const variantStyles = {
      primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      success: 'bg-success-100 text-success-700 hover:bg-success-200',
      warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
      danger: 'bg-danger-100 text-danger-700 hover:bg-danger-200',
      info: 'bg-accent-100 text-accent-700 hover:bg-accent-200',
      accent: 'bg-accent-100 text-accent-800 hover:bg-accent-200',
      gradient: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-sm',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyles} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
