export class Agent {
  constructor(busEl, model, tools) {
    busEl.addEventListener("user", this.onUserEvent.bind(this));
    this._bus = busEl;
    this._model = model;
    this._tools = tools;
  }
  async onUserEvent(e) {
    let promptResult = await this._model.prompt(e.detail);
    let detail = [e.detail];
    while (promptResult.tool) {
      const args = promptResult.tool.arguments || [];
      const toolResult = this._tools[promptResult.tool.name].call(...args);
      detail.push(
        `The output from the "${promptResult.tool.name}" tool is ${toolResult}`
      );
      promptResult = await this._model.prompt(detail);
    }
    if (promptResult.text) {
      this._bus.dispatchEvent(new CustomEvent("assistant"));
    }
  }
}
