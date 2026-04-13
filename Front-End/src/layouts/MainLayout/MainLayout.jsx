import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        background:
          'radial-gradient(circle at center, #484848 0%, #1D1D1D 40%, #000000 100%)',
      }}
    >
      <Outlet />
    </Box>
  )
}

export default MainLayout
