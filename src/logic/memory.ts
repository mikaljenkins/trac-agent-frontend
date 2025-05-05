export interface Message {
  content: string;
  isUser: boolean;
}

export const symbolicIntro: Message[] = [
  {
    content: "Hello! I'm your AI assistant. How can I help you today?",
    isUser: false
  }
]; 