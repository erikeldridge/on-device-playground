import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChromeModel } from './ChromeModel.js'
import { Agent } from './Agent.js'
import {App} from './App.jsx'

const rootEl = document.getElementById('root')

const tools = {
  timestamp: {
    call: () => {
      console.log('timestamp')
      return Date.now()
    },
  },
  timestamp_to_date: {
    call: (ts) => {
      console.log('timestamp_to_date', ts)
      return new Date(ts).toString()
    }
  }
};

const model = new ChromeModel(window.LanguageModel, tools);

new Agent(rootEl, model, tools)

createRoot(rootEl).render(
  <StrictMode>
    <App busEl={rootEl} model={model} />
  </StrictMode>,
)
