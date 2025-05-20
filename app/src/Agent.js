export class Agent {
  constructor(model, tools) {
    this._model = model;
    this._tools = tools;
  }
  async isAvailable(){
    return this._model.isAvailable()
  }
  async prompt(prompt) {
    let promptResult = await this._model.prompt(prompt);
    let detail = [prompt];
    while (promptResult.tool) {
      const args = promptResult.tool.arguments || [];
      const toolResult = this._tools[promptResult.tool.name].call(...args);
      detail.push(
        `The output from the "${promptResult.tool.name}" tool is ${toolResult}`
      );
      promptResult = await this._model.prompt(detail);
    }
    return promptResult.text
  }
}
