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
  list_tools: {
    call: () => Object.keys(tools).join(),
    description: `
    A tool for listing all available tools.
    Arguments: none.
    Returns: a string containining tool names separated by commas.
    Use this tool by responding with "list_tools" in the "tool" field.
    Example 1: if a user asks "what tools are available?", and the tools are foo, bar and baz, respond with "foo,bar,baz".
    Example 2: if a user asks "list tools", and the tools are add and remove, respond with "add,remove".
    `,
  },
  add_numbers: {
    call: function () {
      const numbers = Array.from(arguments);
      console.log("add_numbers", numbers);
      return numbers.reduce((prev, curr) => prev + curr, 0);
    },
    description: `
    A tool for adding numbers.
    Arguments: a javascript array of numbers to add.
    Returns: the sum, as a number.
    Use this tool by responding with "add_numbers" in the "tool" field, and a javascript array of the numers to add in the "arguments" field, but only if there are two or more numbers given.
    Example 1: if a user asks "what's 2 + 2?", respond with '{"tool":{"name":"add_numbers", "arguments":[2,2]}}'.
    Example 2: if a user asks "what's 1 + 2 + 3?", respond with '{"tool":{"name":"add_numbers", "arguments":[1,2,3]}}'.
    Example 3: if a user states "the output of the 'add_numbers' tool is 4", and asks "2 + 2", respond with '{"text":"2 + 2 = 4"}'.
    Example 4: if a user asks "what's three plus three?", respond with '{"tool":{"name":"add_numbers", "arguments":[3,4]}}'.
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
