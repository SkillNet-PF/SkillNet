import React from 'react';
import { Select as MuiSelect, SelectProps as MuiSelectProps, MenuItem, FormControl, InputLabel } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  placeholder?: string;
  options: SelectOption[];
  variant?: 'outlined' | 'filled' | 'standard';
}

const Select: React.FC<SelectProps> = ({ 
  placeholder = 'Seleccionar...', 
  options, 
  variant = 'outlined',
  ...props 
}) => {
  return (
    <FormControl fullWidth>
      <MuiSelect
        variant={variant}
        displayEmpty
        sx={{
          borderRadius: 2,
          backgroundColor: '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
            borderWidth: 2,
          },
        }}
        {...props}
      >
        <MenuItem value="" disabled>
          <em style={{ color: '#9ca3af' }}>{placeholder}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
