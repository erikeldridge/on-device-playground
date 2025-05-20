export class Agent {
  constructor(model, tools) {
    this._model = model;
    this._tools = tools;
  }
  async isAvailable() {
    return this._model.isAvailable();
  }
  async prompt(prompt) {
    const responseConstraint = {
      type: "object",
      additionalProperties: false,
      properties: {
        text: {
          type: "string",
        },
        tool: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            arguments: {
              type: "array",
              items: {
                type: "number",
              },
            },
          },
        },
      },
    };
    let promptResult = await this._model.prompt(prompt, {
      responseConstraint,
    });
    let detail = [prompt];
    while (promptResult.tool) {
      const args = promptResult.tool.arguments || [];
      const toolResult = this._tools[promptResult.tool.name].call(...args);
      detail.push(
        `The output from the "${promptResult.tool.name}" tool is ${toolResult}`
      );
      promptResult = await this._model.prompt(detail, {
        responseConstraint,
      });
    }
    return promptResult.text;
  }
}
