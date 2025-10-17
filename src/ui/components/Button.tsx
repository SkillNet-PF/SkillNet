import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', loading = false, children, ...props }, ref) => {
    const getVariantProps = () => {
      switch (variant) {
        case 'primary':
          return {
            variant: 'contained' as const,
            sx: {
              backgroundColor: '#2563eb',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#6b7280',
              },
            },
          };
        case 'secondary':
          return {
            variant: 'contained' as const,
            sx: {
              backgroundColor: '#f59e0b',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d97706',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#6b7280',
              },
            },
          };
        case 'outline':
          return {
            variant: 'outlined' as const,
            sx: {
              borderColor: '#d1d5db',
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#9ca3af',
              },
              '&:disabled': {
                borderColor: '#d1d5db',
                color: '#9ca3af',
              },
            },
          };
        case 'ghost':
          return {
            variant: 'text' as const,
            sx: {
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
              '&:disabled': {
                color: '#9ca3af',
              },
            },
          };
        default:
          return { variant: 'contained' as const };
      }
    };

    const getSizeProps = () => {
      switch (size) {
        case 'small':
          return { size: 'small' as const };
        case 'large':
          return { size: 'large' as const };
        default:
          return { size: 'medium' as const };
      }
    };

    const variantProps = getVariantProps();
    const sizeProps = getSizeProps();

    return (
      <MuiButton
        ref={ref}
        {...variantProps}
        {...sizeProps}
        disabled={loading || props.disabled}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          ...variantProps.sx,
          ...props.sx,
        }}
        {...props}
      >
        {loading ? 'Cargando...' : children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;