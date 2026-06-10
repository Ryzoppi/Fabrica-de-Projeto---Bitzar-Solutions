import { Box, Chip, Typography } from '@mui/material'
import { InsertDriveFile as FileIcon } from '@mui/icons-material'
import LogoMark from 'assets/favicon.svg?react'

const Topbar = ({ fileName }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      py: 1.5,
      bgcolor: '#111114',
      borderBottom: '0.5px solid #1e1e22',
      flexShrink: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LogoMark width={24} height={24} />
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#f1f1f0',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        Dash<span style={{ color: '#2dd4bf' }}>ify</span>
      </Typography>
    </Box>

    {fileName && (
      <Chip
        icon={<FileIcon sx={{ fontSize: 14, color: '#0d9488 !important' }} />}
        label={fileName}
        size="small"
        sx={{
          bgcolor: 'rgba(13,148,136,0.08)',
          color: '#888',
          border: '0.5px solid rgba(13,148,136,0.25)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          maxWidth: 240,
          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
    )}
  </Box>
)

export default Topbar
