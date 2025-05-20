import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export function App({ busEl, model }) {
  const [prompt, setPrompt] = useState(
    "generate the current timestamp and then convert that timestamp to a date string"
  );
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
