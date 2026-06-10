import { Route, Routes } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import faviconUrl from './assets/favicon.svg'
import { Chat } from 'views'
import { MainLayout } from 'layouts'

const App = () => {
  return (
    <>
      <Helmet>
        <title>Dashify</title>
        <link rel="icon" type="image/svg+xml" href={faviconUrl} />
      </Helmet>

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Chat />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
