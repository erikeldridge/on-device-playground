import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {App, ChromeModel, Reactor} from './App.jsx'

const rootEl = document.getElementById('root')

const tools = {
  timestamp: {
    call: () => Date.now(),
  },
};

const model = new ChromeModel(window.LanguageModel, tools);

new Reactor(rootEl, model)

createRoot(rootEl).render(
  <StrictMode>
    <App busEl={rootEl} model={model} />
  </StrictMode>,
)
