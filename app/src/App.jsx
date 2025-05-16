import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export class ChromeModel {
  constructor(provider, tools = {}, history = []) {
    this._provider = provider;
    this._tools = tools;
    this.history = history;
  }
  async isAvailable() {
    if (!this._provider) {
      return false;
    }
    const availability = await this._provider.availability();
    // Ref https://github.com/webmachinelearning/prompt-api#testing-available-options-before-creation
    switch (availability) {
      case "available":
        return true;
      case "downloadable":
        // Triggers download.
        this._provider.create();
      // Falls through.
      default:
        return false;
    }
  }
  async prompt(prompt) {
    console.log(`Raw prompt: ${prompt}`);
    const session = await this.session();
    const normalized = ChromeModel.normalize(prompt);
    console.log(`Normalized prompt:`, normalized);
    this.history.push(normalized);
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        text: {
          type: "string",
        },
        tool: {
          type: "string",
        },
      },
    };
    const json = await session.prompt(normalized, {
      responseConstraint: schema,
    });
    console.log("Raw response", json);
    const parsed = JSON.parse(json);
    console.log("Parsed response", parsed);
    if (parsed.text) {
      this.history.push([{ role: "function", content: parsed.text }]);
    }
    return parsed;
  }
  /**
   * Normalizes to the most complex type supported by
   * https://github.com/webmachinelearning/prompt-api#full-api-surface-in-web-idl
   * currently sequence<LanguageModelMessageShorthand>.
   */
  static normalize(prompt) {
    if (typeof prompt === "string") {
      return [{ role: "user", content: prompt }];
    }
    return prompt;
  }
  async session() {
    if (!this._session) {
      console.log("Creating session");
      this._session = await this._provider.create({
        initialPrompts: [
          {
            role: "system",
            content: `
            You are a helpful assistant. You use the given schema to respond with either text in the "text" field, or a tool to use in the "tool" field.
            If a tool's output has been given, do not recommend the tool again.
            Available tools:
            - timestamp: A tool for getting the current Unix timestamp. Use this tool by responding with "timestamp" in the "tool" field.
            `,
          },
        ],
      });
    }
    return this._session;
  }
}

export class Reactor {
  constructor(busEl, model, tools) {
    busEl.addEventListener("user", this.onUserEvent.bind(this));
    this._bus = busEl;
    this._model = model;
    this._tools = tools;
  }
  async onUserEvent(e) {
    let promptResult = await this._model.prompt(e.detail);
    if (promptResult.tool) {
      const toolResult = this._tools[promptResult.tool].call();
      promptResult = await this._model.prompt([
        {
          role: "user",
          content: `The output from the "${promptResult.tool}" tool is ${toolResult}`,
        },
        { role: "user", content: e.detail },
      ]);
      this._bus.dispatchEvent(new CustomEvent("assistant"));
    }
    if (promptResult.text) {
      this._bus.dispatchEvent(new CustomEvent("assistant"));
    }
  }
}

export function App({ busEl, model }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    model.isAvailable().then(setIsAvailable);
    busEl.addEventListener("assistant", (e) => {
      e.stopImmediatePropagation();
      // Flattens nested content arrays for simpler view rendering.
      const flatHistory = model.history.flatMap((item) => item);
      setOutput(flatHistory);
      setPrompt("");
    });
  }, [model, busEl]);
  async function onSubmit(e) {
    e.preventDefault();
    busEl.dispatchEvent(new CustomEvent("user", { detail: prompt }));
  }
  function onChange(e) {
    setPrompt(e.target.value);
  }
  const outputItems = output.map((content, i) => {
    return (
      <li key={i} className={content.role}>
        <ReactMarkdown children={content.content} />
      </li>
    );
  });
  return (
    <div className="container">
      <ol id="output">{outputItems}</ol>
      <form onSubmit={onSubmit}>
        <textarea value={prompt} onChange={onChange}></textarea>
        <button type="submit" disabled={!isAvailable}>
          Send
        </button>
      </form>
    </div>
  );
}
