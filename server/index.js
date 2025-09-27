import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Twilio webhook endpoint for call status updates
app.post('/api/twilio/status', async (req, res) => {
  try {
    const { CallSid, CallStatus, RecordingUrl, Duration } = req.body;
    
    console.log('Twilio status update:', { CallSid, CallStatus, RecordingUrl, Duration });

    // Update call status in database
    const { error } = await supabase
      .from('calls')
      .update({
        status: CallStatus,
        recording_url: RecordingUrl,
        duration_minutes: Duration ? Math.round(Duration / 60) : null
      })
      .eq('twilio_sid', CallSid);

    if (error) {
      console.error('Database update error:', error);
      return res.status(500).send('Database update failed');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

// TwiML endpoint for call instructions
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

// Recording endpoint
app.post('/api/twilio/recording', (req, res) => {
  console.log('Recording received:', req.body);
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Twilio webhook server running on port ${port}`);
  console.log(`Webhook URL: http://localhost:${port}/api/twilio/status`);
});
