import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { GraphQLProvider } from './graphql'

const basename = import.meta.env.PROD ? '/ski-resort-look-up' : '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphQLProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </GraphQLProvider>
  </StrictMode>,
)
