import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Paperclip as PaperclipIcon, Send as SendIcon } from 'react-feather'
import { Controller, useFormContext } from 'react-hook-form'

const PromptField = ({ onAttachClick, onSubmit }) => {
  const { control } = useFormContext()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Controller
      name="prompt"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          multiline
          maxRows={6}
          placeholder="Com o que posso ajudar?"
          variant="outlined"
          name="prompt"
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { color: '#fff' },
                    }}
                    onClick={onAttachClick}
                  >
                    <PaperclipIcon size={20} />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { color: '#fff' },
                    }}
                    onClick={onSubmit}
                  >
                    <SendIcon size={20} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: '#ffffff',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },

                '& textarea': {
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
                },
              },
            },
          }}
        />
      )}
    />
  )
}

export default PromptField
