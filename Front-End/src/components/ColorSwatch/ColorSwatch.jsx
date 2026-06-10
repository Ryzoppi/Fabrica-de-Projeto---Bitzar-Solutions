import { useId } from 'react'

import { Box, Typography } from '@mui/material'

const ColorSwatch = ({ color, onChange }) => {
  const inputId = `swatch-colors-${useId().toString(36).slice(2)}`

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="label"
        htmlFor={inputId}
        sx={{
          width: 22,
          height: 22,
          borderRadius: '4px',
          bgcolor: color,
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'block',
        }}
      />
      <Typography
        sx={{
          fontSize: '0.7rem',
          color: '#666',
          fontFamily: 'monospace',
          letterSpacing: '0.03em',
        }}
      >
        {color}
      </Typography>
      <input
        id={inputId}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </Box>
  )
}

export default ColorSwatch
