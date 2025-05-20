export class ChromeModel {
  constructor(provider, tools = {}) {
    this._provider = provider;
    this._tools = tools;
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
    const normalized = ChromeModel.normalize(prompt);
    console.log(`Normalized prompt:`, normalized);
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
    const json = await session.prompt(normalized, {
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
      this._session = await this._provider.create({
        initialPrompts: [
          {
            role: "system",
            content: `
            You are a helpful assistant.
            You use the given schema to respond with either text in the "text" field, or a tool to use in the "tool" field.
            You do not use the same tool twice in a row.
            Available tools:
            - timestamp: A tool for getting the current Unix timestamp.
              Arguments: none.
              Returns: a number.
              Use this tool by responding with "timestamp" in the "tool" field.
              Example 1: if user asks "what's the current timestamp?", respond with {"tool":{"name":"timestamp"}}.
              Example 2: if user states "the output of the 'timestamp' tool is 123", and then asks "what's the current timestamp?", respond with '{"text":"the current timestamp is 123"}'.
            - timestamp_to_date: A tool for converting a Unix timestamp to a string representing this date.
              Arguments: a numeric timestamp.
              Returns: a string.
              Use this tool by responding with "timestamp_to_date" in the "tool" field.
              Example 1: if user states "the output of the 'timestamp' tool is 123", and then asks "what's the current date?", respond with '{"tool":{"name":"timestamp_to_date", "arguments":[123]}}'.
              Example 2: if user states "the output of the 'timestamp_to_date' tool is Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)", and then asks "what's the current date?", respond with '{"text":"the current date is Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)"}'.
            `,
          },
        ],
      });
    }
    return this._session;
  }
}
