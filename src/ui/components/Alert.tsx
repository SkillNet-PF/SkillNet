import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, Typography } from '@mui/material';

export interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  severity?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ 
  severity = 'info', 
  title, 
  children, 
  ...props 
}) => {
  return (
    <MuiAlert
      severity={severity}
      sx={{
        borderRadius: 2,
        '& .MuiAlert-icon': {
          fontSize: '1.25rem',
        },
        '& .MuiAlert-message': {
          width: '100%',
        },
        ...props.sx,
      }}
      {...props}
    >
      {title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2">
        {children}
      </Typography>
    </MuiAlert>
  );
};

export default Alert;
