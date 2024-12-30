export abstract class BaseErrorMessages {
  abstract messages: Record<string, string>;

  getMessage(key: string): string {
    if (!this.messages[key]) {
      throw new Error(`Error message key "${key}" not found.`);
    }
    return this.messages[key];
  }

  dynamicMessage(message: string, params: Record<string, string>): string {
    Object.keys(params).forEach((key: string) => {
      message = message.replace(`\${${key}}`, params[key]);
    });
    return message;
  }
}
