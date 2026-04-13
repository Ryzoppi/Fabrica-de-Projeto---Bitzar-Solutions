import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Download as DownloadIcon, File as FileIcon } from 'react-feather'

import helpers from 'helpers'

const AttachmentChip = ({ file }) => {
  const { color } = helpers.chat.getFileStyle(file.type)

  const handleDownload = () => {
    const url = file instanceof File ? URL.createObjectURL(file) : file.url

    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()

    if (file instanceof File) URL.revokeObjectURL(url)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        px: 1.5,
        py: 0.75,
        maxWidth: 220,
      }}
    >
      <FileIcon size={14} color={color} style={{ flexShrink: 0 }} />

      <Typography
        variant="caption"
        sx={{
          color: '#e2e8f0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {file.name}
      </Typography>

      <Tooltip title="Baixar arquivo">
        <IconButton
          size="small"
          onClick={handleDownload}
          sx={{
            p: 0.25,
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { color: '#fff' },
          }}
        >
          <DownloadIcon size={13} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default AttachmentChip
