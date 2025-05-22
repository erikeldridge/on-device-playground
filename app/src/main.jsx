import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OnDeviceModel } from "./OnDeviceModel.js";
import { Agent } from "./Agent.js";
import { App } from "./App.jsx";

const model = new OnDeviceModel(window.LanguageModel, {
  initialPrompts: [
    {
      role: "system",
      content: `
      You are a javascript expert.
      You solve problems by breaking them down in to pieces.
      `,
    },
  ],
});

const agent = new Agent(model);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App agent={agent} />
  </StrictMode>
);
