import { Box, Typography } from '@mui/material'

import { AttachmentChip } from '../../components'

const UserMessage = ({ msg }) => {
  const hasText = !!msg.content?.trim()
  const hasAttachments =
    Array.isArray(msg.attachments) && msg.attachments.length > 0

  return (
    <Box
      sx={{
        alignSelf: 'flex-end',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 0.75,
        maxWidth: '75%',
      }}
    >
      {hasAttachments && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            justifyContent: 'flex-end',
          }}
        >
          {msg.attachments.map((file, i) => (
            <AttachmentChip key={i} file={file} />
          ))}
        </Box>
      )}

      {hasText && (
        <Box
          sx={{
            backgroundColor: '#0d9488',
            color: '#f0fdfb',
            px: 2,
            py: 1.5,
            borderRadius: '15px 15px 0 15px',
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default UserMessage
