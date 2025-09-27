import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pkg from 'twilio';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Twilio client - using destructuring for CommonJS compatibility
const { Twilio } = pkg;
const twilio = new Twilio(
  process.env.VITE_TWILIO_ACCOUNT_SID,
  process.env.VITE_TWILIO_AUTH_TOKEN
);

// API endpoint to make calls
app.post('/api/make-call', async (req, res) => {
  try {
    const { phoneNumber, clientId, userId } = req.body;
    
    if (!phoneNumber || !clientId || !userId) {
      return res.status(400).json({ error: 'Missing required fields: phoneNumber, clientId, userId' });
    }

    // Add comprehensive debugging
    const fromNumber = process.env.VITE_TWILIO_PHONE_NUMBER;
    console.log('=== CALL DEBUGGING ===');
    console.log('Environment from number:', fromNumber);
    console.log('Twilio account SID:', process.env.VITE_TWILIO_ACCOUNT_SID);
    console.log('Call will be made FROM:', fromNumber, 'TO:', phoneNumber);

    // Make the call using Twilio
    const call = await twilio.calls.create({
      to: phoneNumber,
      from: fromNumber,
      url: `${process.env.VITE_TWILIO_WEBHOOK_URL}/api/twilio/voice`,
      record: true,
      statusCallback: `${process.env.VITE_TWILIO_WEBHOOK_URL}/api/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log('✅ Call created successfully:', call.sid);

    // Store call in database
    const { data: callData, error: dbError } = await supabase
      .from('calls')
      .insert({
        client_id: clientId,
        user_id: userId,
        call_type: 'outbound',
        status: 'initiated',
        twilio_sid: call.sid,
        call_source: 'twilio',
        external_call_id: call.sid,
        integration_config: {
          phoneNumber,
          startTime: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to store call in database' });
    }

    res.json({ 
      success: true, 
      callSid: call.sid,
      callId: callData.id,
      status: 'initiated'
    });

  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to make call' });
  }
});

// Twilio webhook endpoint for call status updates
app.post('/api/twilio/status', async (req, res) => {
  try {
    const { CallSid, CallStatus, RecordingUrl, Duration } = req.body;
    
    console.log('Status webhook received:', { CallSid, CallStatus, RecordingUrl, Duration });

    // Update call status in database
    const updates = { status: CallStatus.toLowerCase() };
    
    if (RecordingUrl) {
      updates.recording_url = RecordingUrl;
    }
    
    if (Duration) {
      updates.duration_minutes = Math.round(Duration / 60);
    }

    const { error } = await supabase
      .from('calls')
      .update(updates)
      .eq('twilio_sid', CallSid);

    if (error) {
      console.error('Database update error:', error);
    }

    res.send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// Twilio webhook endpoint for voice instructions
app.post('/api/twilio/voice', (req, res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! This is a test call from your logistics AI system.</Say>
  <Pause length="2"/>
  <Say>How can we help you with your logistics needs today?</Say>
  <Record maxLength="300" action="/api/twilio/recording"/>
</Response>`;
  
  res.type('text/xml');
  res.send(twiml);
});

// Twilio webhook endpoint for recording
app.post('/api/twilio/recording', (req, res) => {
  console.log('Recording received:', req.body);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Twilio webhook server running on port ${port}`);
  console.log(`Webhook URL: http://localhost:${port}/api/twilio/status`);
});

// Add error handling to prevent server from exiting
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit the process
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
