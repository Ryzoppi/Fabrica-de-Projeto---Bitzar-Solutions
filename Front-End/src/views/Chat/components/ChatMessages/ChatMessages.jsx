import { Box } from '@mui/material'

import { AiMessage, LoadingMessage, UserMessage } from './components'

const ChatMessages = ({ chatHistory, isLoading, onCancel, iaStatus }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
    {chatHistory.map((msg, index) =>
      msg.role === 'user' ? (
        <UserMessage key={index} msg={msg} />
      ) : (
        <AiMessage key={index} msg={msg} />
      ),
    )}

    {isLoading && <LoadingMessage iaStatus={iaStatus} onCancel={onCancel} />}
  </Box>
)

export default ChatMessages
