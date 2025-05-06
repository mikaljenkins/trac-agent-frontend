interface NotifyUserParams {
  text: string;
}

interface Tools {
  message_notify_user: (params: NotifyUserParams) => Promise<void>;
}

export const tools: Tools = {
  message_notify_user: async ({ text }) => {
    console.log('[TracAgent Notification]:', text);
  }
}; 