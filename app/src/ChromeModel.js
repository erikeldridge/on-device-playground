export class ChromeModel {
  constructor(provider, createOptions = {}) {
    this._provider = provider;
    this._createOptions = createOptions;
  }
  async isAvailable() {
    if (!this._provider) {
      return false;
    }
    const availability = await this._provider.availability();
    // Ref https://github.com/webmachinelearning/prompt-api#testing-available-options-before-creation
    switch (availability) {
      case "available":
        return true;
      case "downloadable":
        // Triggers download.
        this._provider.create();
      // Falls through.
      default:
        return false;
    }
  }
  async prompt(prompt) {
    console.log(`Raw prompt: ${prompt}`);
    const session = await this.session();
    const schema = {
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
    const json = await session.prompt(prompt, {
      responseConstraint: schema,
    });
    console.log("Raw response", json);
    const parsed = JSON.parse(json);
    console.log("Parsed response", parsed);
    return parsed;
  }

  /**
   * Normalizes to the most complex type supported by
   * https://github.com/webmachinelearning/prompt-api#full-api-surface-in-web-idl
   * currently sequence<LanguageModelMessageShorthand>.
   */
  static normalize(prompt) {
    if (typeof prompt === "string") {
      return [{ role: "user", content: prompt }];
    }
    return prompt;
  }
  async session() {
    if (!this._session) {
      console.log("Creating session");
      this._session = await this._provider.create(this._createOptions);
    }
    return this._session;
  }
}
