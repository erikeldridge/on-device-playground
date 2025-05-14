import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

class ChromeModel {
  constructor(provider) {
    this._provider = provider;
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
    const session = await this.session();
    return session.prompt(prompt);
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
  const [output, setOutput] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    model.isAvailable().then(setIsAvailable);
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    const promptEl = e.target.prompt;
    const markdown = await model.prompt(promptEl.value);
    setOutput(markdown);
    promptEl.value = "";
    promptEl.focus();
  }
  return (
    <div className="container">
      <div id="output">
        <ReactMarkdown children={output} />
      </div>
      <form onSubmit={handleSubmit}>
        <textarea name="prompt"></textarea>
        <button type="submit" disabled={!isAvailable}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
