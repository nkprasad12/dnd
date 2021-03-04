export interface ChatMessage {
  header?: string;
  body: string;
}

export function isChatMessage(input: any): input is ChatMessage {
  return input.body !== undefined;
}
