export abstract class BaseErrorMessages {
  abstract messages: Record<string, string>;

  getMessage(key: string): string {
    if (!this.messages[key]) {
      throw new Error(`Error message key "${key}" not found.`);
    }
    return this.messages[key];
  }
}
