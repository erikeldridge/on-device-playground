import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OnDeviceModel } from "./OnDeviceModel.js";
import { Agent } from "./Agent.js";
import { App } from "./App.jsx";

const tools = {
};


const planner = new OnDeviceModel(window.LanguageModel, {
  initialPrompts: [
    {
      role: "system",
      content: `
      You are an algorithm generator.
      You solve problems by breaking them down in to pieces and then solving each piece.
      You format output as a numbered list.
      Each item in the list is a single sentence of prose.
      Never output code.
      For example, if the prompt is "what's the current date?", respond with "1. construct the current date\n2. convert the date to a string"
      `,
    },
  ],
});

const model = new OnDeviceModel(window.LanguageModel, {
  initialPrompts: [
    {
      role: "system",
      content: `
      You are a javascript code generator.
      You take an algorithm and generate the javascript implementation of that algorithm.
      The javascript must be able to run in a browser.
      You write the briefest code possible.
      Never output code that depends on Node.
      Never log to the console.
      Never use a modal to collect user input.
      The generated code must be wrapped in a function called "main".
      The "main" function must return a value.
      Example 1: if the question is "1+1", then respond "function main(){return 1+1;}".
      `,
    },
  ],
});

const qaModel = new OnDeviceModel(window.LanguageModel, {
  initialPrompts: [
    {
      role: "system",
      content: `
      You are a quality assurance agent.
      You verify if a javascript implementation matches the intended algorithm.
      You only reply with "yes" or "no".
      `,
    },
  ],
});

const agent = new Agent(model, qaModel, planner, tools);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App agent={agent} />
  </StrictMode>
);
