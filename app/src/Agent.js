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
    let plan = await this._planModel.prompt([
      `What are the steps required to solve each piece?`,
      prompt,
    ]);
    console.log(plan);
    let promptResult = await this._metaPrompt(prompt, {
      responseConstraint,
    });
    let detail = ['Use this plan to solve this prompt.', plan, prompt];
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
      [response, qaResponse] = (await Promise.all([
        this._model.prompt(prompt, options),
        this._qaModel.prompt(prompt, options),
      ])).map(JSON.parse)
    //   console.log(`Raw response: ${response}`);
    //   console.log(`Raw response: ${qaResponse}`);
    //   response = JSON.parse(response);
    //   qaResponse = JSON.parse(qaResponse);
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
