export class Agent {
  constructor(busEl, model, tools) {
    busEl.addEventListener("user", this.onUserEvent.bind(this));
    this._bus = busEl;
    this._model = model;
    this._tools = tools;
  }
  async onUserEvent(e) {
    let promptResult = await this._model.prompt(e.detail);
    if (promptResult.tool) {
      const args = promptResult.tool.arguments || [];
      const toolResult = this._tools[promptResult.tool.name].call(...args);
      let detail;
      if (typeof e.detail === "string") {
        detail = [{ role: "user", content: e.detail }];
      } else {
        detail = e.detail;
      }
      detail.push({
        role: "user",
        content: `The output from the "${promptResult.tool.name}" tool is ${toolResult}`,
      });
      this._bus.dispatchEvent(
        new CustomEvent("user", {
          detail,
        })
      );
    }
    if (promptResult.text) {
      this._bus.dispatchEvent(new CustomEvent("assistant"));
    }
  }
}