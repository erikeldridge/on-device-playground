import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OnDeviceModel } from "./OnDeviceModel.js";
import { Agent } from "./Agent.js";
import { App } from "./App.jsx";

const tools = {
  timestamp: {
    call: () => Date.now(),
    description: `
      A tool for getting the current Unix timestamp.
      Arguments: none.
      Returns: a number.
      Use this tool by responding with "timestamp" in the "tool" field.
      Example 1: if user asks "what's the current timestamp?", respond with {"tool":{"name":"timestamp"}}.
      Example 2: if user states "the output of the 'timestamp' tool is 123", and then asks "what's the current timestamp?", respond with '{"text":"the current timestamp is 123"}'.
    `,
  },
  timestamp_to_date: {
    call: (timestamp) => new Date(timestamp).toString(),
    description: `
      A tool for converting a Unix timestamp to a string representing this date.
      Arguments: a numeric timestamp.
      Returns: a string.
      Use this tool by responding with "timestamp_to_date" in the "tool" field.
      Example 1: if user states "the output of the 'timestamp' tool is 123", and then asks "what's the current date?", respond with '{"tool":{"name":"timestamp_to_date", "arguments":[123]}}'.
      Example 2: if user states "the output of the 'timestamp_to_date' tool is Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)", and then asks "what's the current date?", respond with '{"text":"the current date is Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)"}'.
    `,
  },
};

const createOpts = {
  initialPrompts: [
    {
      role: "system",
      content: `
        You are a helpful assistant.
        You use the given schema to respond with either text in the "text" field, or a tool to use in the "tool" field.
        You do not use the same tool twice in a row.
        Available tools:
        ${Object.entries(tools).map(
          ([name, { description }]) => `- ${name}: ${description}`
        )}
        `,
    },
  ],
};

const model = new OnDeviceModel(window.LanguageModel, createOpts);

const qaModel = new OnDeviceModel(window.LanguageModel, createOpts);

const agent = new Agent(model, qaModel, tools);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App agent={agent} />
  </StrictMode>
);
