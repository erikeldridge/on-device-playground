import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export function App({ agent }) {
  const [prompt, setPrompt] = useState(
    "generate the current timestamp and then convert that timestamp to a date string"
  );
  const [output, setOutput] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    agent.isAvailable().then(setIsAvailable);
  }, [agent]);
  async function onSubmit(e) {
    e.preventDefault();
    setOutput([
      ...output,
      {
        role: "user",
        content: prompt,
      },
    ]);
    setPrompt("");
    const response = await agent.prompt(prompt);
    setOutput((queuedOutput) => [
      ...queuedOutput,
      {
        role: "assistant",
        content: response,
      },
    ]);
  }
  function onChange(e) {
    setPrompt(e.target.value);
  }
  const outputItems = output.map((content, i) => {
    return (
      <li key={i} className={content.role}>
        {content.content}
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
