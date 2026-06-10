import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Outlet />
    </Box>
  )
}

export default MainLayout
