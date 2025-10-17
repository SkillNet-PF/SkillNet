import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

const Input = forwardRef<HTMLDivElement, InputProps>(
  ({ variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
            '&.Mui-focused': {
              color: '#2563eb',
            },
          },
          ...props.sx,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
