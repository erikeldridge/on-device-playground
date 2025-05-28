import "./App.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export function App({ agent }) {
  const [prompt, setPrompt] = useState(
    "generate the current timestamp and then convert that timestamp to a date string"
  );
  const [output, setOutput] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [features, setFeatures] = useState(agent.features);
  useEffect(() => {
    agent.isAvailable().then(setIsAvailable);
  }, [agent]);
  async function onSubmit(e) {
    e.preventDefault();
    setOutput([
      ...output,
      {
        role: "user",
        type: "prompt",
        content: prompt,
      },
    ]);
    setPrompt("");
    for await (const response of agent.prompt(prompt)) {
      setOutput((queuedOutput) => [...queuedOutput, response]);
    }
  }
  function onPromptChange(e) {
    setPrompt(e.target.value);
  }
  function onFeatureChange(e) {
    const { id, checked } = e.target;
    setFeatures({
      ...features,
      [id]: checked,
    });
    agent.features[id] = checked;
  }
  const outputItems = output.map((content, i) => {
    return (
      <li key={i} className={content.role}>
        <h2>{content.type}</h2>
        {/* Casts all content to string since markdown must be
        a string, but content may be numeric. */}
        <ReactMarkdown>{String(content.content)}</ReactMarkdown>
      </li>
    );
  });
  const bannerStyle = {
    display: isAvailable ? "none" : "block",
  };
  return (
    <div className="container">
      <div id="banner" style={bannerStyle}>
        Unsupported Browser. Try&nbsp;
        <a href="https://developer.chrome.com/docs/ai/built-in-apis">
          Chrome version 138+.
        </a>
      </div>
      <form id="features">
        <div className="feature">
          <input
            type="checkbox"
            id="plan"
            onChange={onFeatureChange}
            checked={features.plan}
          />
          <label htmlFor="plan">
            Plan: Generate a step-by-step plan prior to generating a response.
          </label>
        </div>
        <div className="feature">
          <input
            type="checkbox"
            id="code"
            onChange={onFeatureChange}
            checked={features.code}
          />
          <label htmlFor="code">
            Code: Generate code to produce a response.
          </label>
        </div>
      </form>
      <ol id="output">{outputItems}</ol>
      <form onSubmit={onSubmit}>
        <textarea value={prompt} onChange={onPromptChange}></textarea>
        <button type="submit" disabled={!isAvailable}>
          Send
        </button>
      </form>
    </div>
  );
}
