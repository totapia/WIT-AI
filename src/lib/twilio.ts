import { Twilio } from 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl: string;
}

export interface CallData {
  callSid: string;
  recordingSid?: string;
  recordingUrl?: string;
  duration?: number;
  status: string;
  from: string;
  to: string;
  startTime: string;
  endTime?: string;
}

class TwilioService {
  private client: Twilio;
  private config: TwilioConfig;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.client = new Twilio(config.accountSid, config.authToken);
  }

  // Initiate a call
  async makeCall(to: string, clientId: string): Promise<string> {
    try {
      const call = await this.client.calls.create({
        to,
        from: this.config.phoneNumber,
        url: this.config.webhookUrl, // TwiML URL for call instructions
        record: true, // Enable recording
        statusCallback: `${this.config.webhookUrl}/status`, // For status updates
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      });

      return call.sid;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  // Fetch recording URL
  async getRecording(callSid: string): Promise<string | null> {
    try {
      const recordings = await this.client.recordings.list({
        callSid,
        limit: 1
      });

      if (recordings.length > 0) {
        return recordings[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error fetching recording:', error);
      return null;
    }
  }

  // Get call details
  async getCallDetails(callSid: string): Promise<CallData | null> {
    try {
      const call = await this.client.calls(callSid).fetch();
      
      return {
        callSid: call.sid,
        duration: call.duration ? parseInt(call.duration) : undefined,
        status: call.status,
        from: call.from,
        to: call.to,
        startTime: call.startTime?.toISOString() || '',
        endTime: call.endTime?.toISOString(),
      };
    } catch (error) {
      console.error('Error fetching call details:', error);
      return null;
    }
  }
}

export default TwilioService;
