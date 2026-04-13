import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Paperclip as PaperclipIcon, Send as SendIcon } from 'react-feather'
import { Controller, useFormContext } from 'react-hook-form'

const PromptField = ({ onAttachClick }) => {
  const { control } = useFormContext()

  return (
    <Controller
      name="prompt"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          placeholder="Com o que posso ajudar?"
          variant="outlined"
          name="prompt"
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
                    onClick={() => console.log('Enviar')}
                  >
                    <SendIcon size={20} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: '#ffffff',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
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
