import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

class ChromeModel {
  constructor(provider, history = []) {
    this._provider = provider;
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
    const response = await session.prompt(normalized);
    this.history.push([{ role: "assistant", content: response }]);
    return response;
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
      this._session = await this._provider.create();
    }
    return this._session;
  }
}

const model = new ChromeModel(window.LanguageModel);

function App() {
  const [output, setOutput] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    model.isAvailable().then(setIsAvailable);
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    const promptEl = e.target.prompt;
    await model.prompt(promptEl.value);
    // Flattens nested arrays for simpler view rendering.
    const flatHistory = model.history.flatMap((item) => item);
    setOutput(flatHistory);
    promptEl.value = "";
    promptEl.focus();
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
        <textarea name="prompt"></textarea>
        <button type="submit" disabled={!isAvailable}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
