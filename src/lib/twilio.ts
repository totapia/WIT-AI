// This file is no longer needed in the frontend
// Twilio functionality is now handled by the server

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl: string;
}

export interface CallData {
  to: string;
  clientId: string;
  userId: string;
}

// This class is now handled by the server
export default class TwilioService {
  // Moved to server/index.js
}
