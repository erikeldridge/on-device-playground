export class Agent {
  constructor(model) {
    this._model = model;
  }
  async isAvailable() {
    return this._model.isAvailable();
  }
  async prompt(prompt) {
    let plan = await this._model.prompt(`
        Generate an algorithm to solve this problem: ${prompt}
        Respond with a numbered list of steps.
        Each step should be a single sentence of prose describing an action to take.
        For example: if the problem is "1+1", respond with
        1) identify the inputs\n
        2) identify the operand\n
        3) perform the operation on the inputs
        `);
    console.log("algo", plan);
    let promptResult = await this._model.prompt(`
        Implement this algorithm using javascript: ${plan}
        For example, if the problem is "square root of 4",
        respond with "function main(){return Math.sqrt(4);}".
        Always wrap the solution in a function called "main".
        Always return a value from the function.
        Never log to the console.
        The javascript must be able to run in a browser.
        `);
    console.log("impl", promptResult);
    const matches = promptResult.match(/```javascript\n([\s\S]*?)\n```/);
    console.log("match", matches[1]);
    let qaResult = await this._model.prompt(`
        Verify the javascript implements the algorithm.
        Respond "yes" if the implementation is correct, or "no" if it isn't.
    `);
    console.log("qa", qaResult);

    return this._eval(matches[1]);
  }
  async _eval(code) {
    const iframe = document.getElementById("sandbox");
    return new Promise((resolve) => {
      window.addEventListener(
        "message",
        (event) => {
          console.log("event", event);
          if (
            event.origin === "null" &&
            event.data &&
            event.data.type === "result"
          ) {
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
