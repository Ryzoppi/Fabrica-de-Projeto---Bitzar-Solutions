import { Box, Chip } from '@mui/material'
import { useFormContext, useWatch } from 'react-hook-form'

const AttachedItems = ({ fileInputRef }) => {
  const { control, setValue } = useFormContext()
  const attachedFiles = useWatch({ control, name: 'files' }) || []

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files)
    setValue('files', [...attachedFiles, ...newFiles])
    event.target.value = null
  }

  const removeFile = (index) => {
    const updatedFiles = attachedFiles.filter((_, i) => i !== index)
    setValue('files', updatedFiles)
  }
  return (
    <>
      {attachedFiles.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {attachedFiles.map((file, index) => (
            <Chip
              key={`${file.name}-${index}`}
              label={file.name}
              onDelete={() => removeFile(index)}
              variant="filled"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '8px',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { color: '#fff' },
                },
              }}
            />
          ))}
        </Box>
      )}

      <input
        type="file"
        multiple
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  )
}

export default AttachedItems
