import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, Typography, Box } from '@mui/material';

export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, ...props }) => {
  return (
    <MuiCard
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        ...props.sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <Box sx={{ p: 3, pb: title || subtitle ? 2 : 3 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: subtitle ? 1 : 0 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children && (
        <CardContent sx={{ pt: title || subtitle ? 0 : 3 }}>
          {children}
        </CardContent>
      )}
    </MuiCard>
  );
};

export default Card;
