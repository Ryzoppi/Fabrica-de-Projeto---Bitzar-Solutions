import { useId, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'

const ColorSwatch = ({ color, onChange }) => {
  const inputId = `swatch-${useId()}`
  const [localColor, setLocalColor] = useState(color)

  const handleChange = (e) => setLocalColor(e.target.value)

  const handleCommit = (e) => onChange(e.target.value)

  useEffect(() => {
    setLocalColor(color)
  }, [color])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="label"
        htmlFor={inputId}
        sx={{
          width: 22,
          height: 22,
          borderRadius: '4px',
          bgcolor: localColor,
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'block',
        }}
      />
      <Typography
        sx={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}
      >
        {localColor}
      </Typography>
      <input
        id={inputId}
        type="color"
        value={localColor}
        onChange={handleChange}
        onBlur={handleCommit}
        onMouseUp={handleCommit}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </Box>
  )
}

export default ColorSwatch
