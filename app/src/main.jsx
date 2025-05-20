import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChromeModel } from "./ChromeModel.js";
import { Agent } from "./Agent.js";
import { App } from "./App.jsx";

const tools = {
  timestamp: {
    call: () => Date.now(),
  },
  timestamp_to_date: {
    call: (timestamp) => new Date(timestamp).toString(),
  },
};

const model = new ChromeModel(window.LanguageModel, tools);

const agent = new Agent(model, tools);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App agent={agent} />
  </StrictMode>
);
