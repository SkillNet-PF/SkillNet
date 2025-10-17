import React from 'react';
import { FormControl, FormLabel, FormHelperText, Box } from '@mui/material';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  error = false, 
  helperText, 
  children 
}) => {
  return (
    <FormControl fullWidth error={error}>
      {label && (
        <FormLabel 
          sx={{ 
            mb: 1, 
            color: '#374151',
            fontWeight: 500,
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#2563eb',
            },
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </FormLabel>
      )}
      <Box>
        {children}
      </Box>
      {helperText && (
        <FormHelperText sx={{ mt: 1, fontSize: '0.75rem' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormField;
