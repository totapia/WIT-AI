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

// Add this test endpoint before the make-call endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Webhook server is running!', 
    timestamp: new Date().toISOString(),
    webhookUrl: `${process.env.VITE_TWILIO_WEBHOOK_URL}/api/twilio/voice`
  });
});

// API endpoint to make calls
app.post('/api/make-call', async (req, res) => {
  try {
    const { phoneNumber, clientId, userId } = req.body;
    
    console.log('=== INCOMING REQUEST ===');
    console.log('Request body:', req.body);
    
    if (!phoneNumber || !clientId || !userId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: phoneNumber, clientId, userId' });
    }

    // Check environment variables
    const requiredEnvVars = {
      'VITE_TWILIO_ACCOUNT_SID': process.env.VITE_TWILIO_ACCOUNT_SID,
      'VITE_TWILIO_AUTH_TOKEN': process.env.VITE_TWILIO_AUTH_TOKEN,
      'VITE_TWILIO_PHONE_NUMBER': process.env.VITE_TWILIO_PHONE_NUMBER,
      'VITE_TWILIO_WEBHOOK_URL': process.env.VITE_TWILIO_WEBHOOK_URL
    };

    console.log('=== ENVIRONMENT CHECK ===');
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.log(`❌ Missing environment variable: ${key}`);
        return res.status(500).json({ error: `Missing environment variable: ${key}` });
      } else {
        console.log(`✅ ${key}: ${key.includes('TOKEN') ? '***' : value}`);
      }
    }

    // Add comprehensive debugging
    const fromNumber = process.env.VITE_TWILIO_PHONE_NUMBER;
    console.log('=== CALL DEBUGGING ===');
    console.log('Environment from number:', fromNumber);
    console.log('Call will be made FROM:', fromNumber, 'TO:', phoneNumber);

    // Validate phone number format
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      console.log('❌ Invalid phone number format:', phoneNumber);
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Make the call using Twilio
    console.log('🔄 Attempting to create Twilio call...');
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
        client_id: clientId === 'custom' ? null : clientId,
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
    
    // Handle specific Twilio errors with user-friendly messages
    if (error.code === 21219) {
      return res.status(400).json({ 
        error: 'Phone number not verified',
        message: 'This phone number is not verified in your Twilio account. Trial accounts can only call verified numbers. Please verify this number in your Twilio console or upgrade to a paid account.',
        code: error.code,
        help: 'Go to Twilio Console → Phone Numbers → Manage → Verified Caller IDs'
      });
    }
    
    if (error.code === 21210) {
      return res.status(400).json({ 
        error: 'From number not verified',
        message: 'The phone number you\'re calling from is not verified. Please verify it in your Twilio console.',
        code: error.code,
        help: 'Go to Twilio Console → Phone Numbers → Manage → Verified Caller IDs'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to make call',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
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
  console.log('Voice webhook called:', req.body);
  
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
  console.log('Recording webhook called:', req.body);
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for your message. We will get back to you soon.</Say>
  <Hangup/>
</Response>`;
  
  res.type('text/xml');
  res.send(twiml);
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
