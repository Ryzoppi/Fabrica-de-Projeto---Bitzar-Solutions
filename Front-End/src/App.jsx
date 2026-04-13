import { Route, Routes } from 'react-router-dom'

import { Chat } from 'views'
import { MainLayout } from 'layouts'

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Chat />} />
      </Route>
    </Routes>
  )
}

export default App
