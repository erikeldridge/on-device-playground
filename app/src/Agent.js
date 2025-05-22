export class Agent {
  constructor(model, qaModel, planModel, tools) {
    this._model = model;
    this._qaModel = qaModel;
    this._planModel = planModel;
    this._tools = tools;
  }
  async isAvailable() {
    return this._model.isAvailable();
  }
  async prompt(prompt) {
    let plan = await this._planModel.prompt([
      "Generate an algorithm to solve this problem",
      prompt,
    ]);
    console.log("algo", plan);
    let promptResult = await this._model.prompt([
      "Implement the following algorithm using javascript",
      plan,
    ]);
    console.log("impl", promptResult);
    let qaResult = await this._qaModel.prompt([
      promptResult,
      "does this implement the prompt?",
      prompt,
    ]);
    console.log("qa", qaResult);
    const matches = promptResult.match(/```javascript\n([\s\S]*?)\n```/);
    console.log("match", matches[1]);
    return this._eval(matches[1]);
  }
  async _eval(code) {
    const iframe = document.getElementById("sandbox");
    return new Promise((resolve) => {
      window.addEventListener(
        "message",
        (event) => {
          console.log("event", event);
          if (event.origin === 'null' && event.data && event.data.type === "result") {
            console.log("result", event.data.result);
            resolve(event.data.result);
            URL.revokeObjectURL(iframe.src);
            iframe.src = "about:blank";
          }
        },
        { once: true }
      );
      const html = `
        <!DOCTYPE html><html><body><script>
        ${code}
        window.parent.postMessage({ type: 'result', result: main() }, '*');
        </script></body></html>
        `;
      const blob = new Blob([html], { type: "text/html" });
      iframe.src = URL.createObjectURL(blob);
    });
  }
}
