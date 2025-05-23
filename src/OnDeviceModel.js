export class OnDeviceModel {
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
  async prompt(prompt, options = {}) {
    console.log(`Prompt`, prompt)
    const session = await this.session();
    return session.prompt(prompt, options);
  }
  async session() {
    if (!this._session) {
      console.log("Creating session");
      this._session = await this._provider.create(this._createOptions);
    }
    return this._session;
  }
}
