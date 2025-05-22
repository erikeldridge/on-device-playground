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
      prompt,
      `Break the problem down into pieces.`,
    ]);
    console.log(plan);
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
    let detail = [
      prompt,
      `Use the following plan to solve the problem: ${plan}`,
    ];
    let promptResult = await this._metaPrompt(detail, {
      responseConstraint,
    });
    while (promptResult.tool) {
      const args = promptResult.tool.arguments || [];
      const toolResult = this._tools[promptResult.tool.name].call(...args);
      detail.push(
        `The output from the "${promptResult.tool.name}" tool is ${toolResult}`
      );
      promptResult = await this._metaPrompt(detail, {
        responseConstraint,
      });
    }
    return promptResult.text;
  }
  async _metaPrompt(prompt, options) {
    let response, qaResponse;
    for (let i = 0; i < 3; i++) {
      [response, qaResponse] = (
        await Promise.all([
          this._model.prompt(prompt, options),
          this._qaModel.prompt(prompt, options),
        ])
      ).map(JSON.parse);
      console.log("Parsed response", response);
      console.log("Parsed response", qaResponse);
      if (
        (response.tool &&
          qaResponse.tool &&
          response.tool.name === qaResponse.tool.name) ||
        (response.text && qaResponse.text)
      ) {
        console.log("consistent");
        break;
      }
    }
    return response;
  }
}
