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
const twilio = pkg(
  process.env.VITE_TWILIO_ACCOUNT_SID,
  process.env.VITE_TWILIO_ACCOUNT_AUTH_TOKEN  // Use Account Auth Token for API calls
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
        client_id: (clientId === 'custom' || clientId === 'quick-call') ? null : clientId,
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

// Replace the /api/twilio/voice endpoint with enhanced logging:
app.post('/api/twilio/voice', (req, res) => {
  console.log('=== VOICE WEBHOOK CALLED ===');
  console.log('Request body:', req.body);
  console.log('Timestamp:', new Date().toISOString());
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.VITE_TWILIO_PHONE_NUMBER}" 
        record="record-from-answer" 
        recordingStatusCallback="${process.env.VITE_TWILIO_WEBHOOK_URL}/api/twilio/recording"
        timeout="30"
        hangupOnStar="true"
        action="${process.env.VITE_TWILIO_WEBHOOK_URL}/api/twilio/dial-status"
        method="POST"
        machineDetection="DetectMessageEnd"
        machineDetectionTimeout="30"
        machineDetectionSpeechThreshold="2400"
        machineDetectionSpeechEndThreshold="500"
        machineDetectionSilenceTimeout="5000">
    ${req.body.To}
  </Dial>
</Response>`;

  console.log('Generated TwiML:', twiml);
  console.log('=== END VOICE WEBHOOK ===');
  
  res.type('text/xml');
  res.send(twiml);
});

// Enhanced dial status webhook with detailed step tracking
app.post('/api/twilio/dial-status', async (req, res) => {
  console.log('=== DIAL STATUS WEBHOOK CALLED ===');
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const { 
      CallSid, 
      DialCallStatus, 
      DialCallDuration,
      AnsweredBy,
      MachineDetectionResult,
      CallStatus,
      From,
      To,
      Direction
    } = req.body;
    
    // Detailed logging for each step
    console.log('=== CALL ANALYSIS ===');
    console.log(`Call SID: ${CallSid}`);
    console.log(`Dial Status: ${DialCallStatus}`);
    console.log(`Call Duration: ${DialCallDuration} seconds`);
    console.log(`Answered By: ${AnsweredBy}`);
    console.log(`Machine Detection: ${MachineDetectionResult}`);
    console.log(`Call Status: ${CallStatus}`);
    console.log(`From: ${From} -> To: ${To}`);
    console.log(`Direction: ${Direction}`);
    
    let finalStatus = 'completed';
    let isVoicemail = false;
    let detectionMethod = 'unknown';
    let confidence = 0;
    
    // Step-by-step detection logic with detailed logging
    console.log('=== DETECTION PROCESS ===');
    
    if (AnsweredBy === 'machine') {
      finalStatus = 'voicemail';
      isVoicemail = true;
      detectionMethod = 'twilio-ml';
      confidence = 95;
      console.log('✅ DETECTED: VOICEMAIL (Twilio ML) - Confidence: 95%');
    } else if (AnsweredBy === 'human') {
      finalStatus = 'answered-human';
      detectionMethod = 'twilio-ml';
      confidence = 95;
      console.log('✅ DETECTED: HUMAN ANSWER (Twilio ML) - Confidence: 95%');
    } else if (MachineDetectionResult === 'machine') {
      finalStatus = 'voicemail';
      isVoicemail = true;
      detectionMethod = 'twilio-machine-detection';
      confidence = 80;
      console.log('✅ DETECTED: VOICEMAIL (Machine Detection) - Confidence: 80%');
    } else if (MachineDetectionResult === 'human') {
      finalStatus = 'answered-human';
      detectionMethod = 'twilio-machine-detection';
      confidence = 80;
      console.log('✅ DETECTED: HUMAN ANSWER (Machine Detection) - Confidence: 80%');
    } else if (DialCallStatus === 'no-answer') {
      finalStatus = 'no-answer';
      detectionMethod = 'timeout';
      confidence = 100;
      console.log(`⏰ DETECTED: NO ANSWER (30-second timeout reached) - Confidence: 100%`);
    } else if (DialCallStatus === 'busy') {
      finalStatus = 'busy';
      detectionMethod = 'busy-signal';
      confidence = 100;
      console.log('📞 DETECTED: BUSY SIGNAL - Confidence: 100%');
    } else if (DialCallStatus === 'failed') {
      finalStatus = 'failed';
      detectionMethod = 'connection-failed';
      confidence = 100;
      console.log('❌ DETECTED: CALL FAILED - Confidence: 100%');
    } else if (DialCallStatus === 'completed') {
      // Fallback analysis for completed calls without ML detection
      if (DialCallDuration > 45 && DialCallDuration < 120) {
        finalStatus = 'voicemail-likely';
        isVoicemail = true;
        detectionMethod = 'duration-pattern';
        confidence = 60;
        console.log(`🤔 DETECTED: LIKELY VOICEMAIL (Duration: ${DialCallDuration}s) - Confidence: 60%`);
      } else if (DialCallDuration < 10) {
        finalStatus = 'answered-brief';
        detectionMethod = 'duration-pattern';
        confidence = 70;
        console.log(`👤 DETECTED: BRIEF HUMAN ANSWER (Duration: ${DialCallDuration}s) - Confidence: 70%`);
      } else {
        finalStatus = 'completed-unknown';
        detectionMethod = 'duration-fallback';
        confidence = 30;
        console.log(`❓ DETECTED: UNKNOWN (Duration: ${DialCallDuration}s) - Confidence: 30%`);
      }
    } else {
      finalStatus = DialCallStatus;
      detectionMethod = 'raw-status';
      confidence = 50;
      console.log(`📋 DETECTED: RAW STATUS (${DialCallStatus}) - Confidence: 50%`);
    }
    
    console.log('=== FINAL DETECTION RESULT ===');
    console.log(`Status: ${finalStatus}`);
    console.log(`Is Voicemail: ${isVoicemail}`);
    console.log(`Method: ${detectionMethod}`);
    console.log(`Confidence: ${confidence}%`);
    
    // Enhanced database update with detailed metadata
    const metadata = {
      is_voicemail: isVoicemail,
      detection_method: detectionMethod,
      confidence_score: confidence,
      answered_by: AnsweredBy,
      machine_detection_result: MachineDetectionResult,
      dial_duration: DialCallDuration,
      dial_status: DialCallStatus,
      call_status: CallStatus,
      detection_timestamp: new Date().toISOString(),
      ml_available: !!AnsweredBy,
      timeout_reached: DialCallStatus === 'no-answer'
    };
    
    const { error } = await supabase
      .from('calls')
      .update({ 
        status: finalStatus,
        duration_minutes: Math.round((DialCallDuration || 0) / 60),
        metadata: metadata
      })
      .eq('twilio_sid', CallSid);
    
    if (error) {
      console.error('❌ DATABASE UPDATE ERROR:', error);
    } else {
      console.log(`✅ DATABASE UPDATED: Call ${CallSid} marked as ${finalStatus}`);
    }
    
    // Log call termination
    console.log('=== CALL TERMINATION ===');
    console.log('Sending Hangup TwiML to prevent retries...');
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
    
    console.log('=== DIAL STATUS WEBHOOK COMPLETE ===');
    
    res.type('text/xml');
    res.send(twiml);
    
  } catch (error) {
    console.error('❌ ERROR IN DIAL STATUS WEBHOOK:', error);
    
    // Still end the call even if there's an error
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
    
    res.type('text/xml');
    res.send(twiml);
  }
});

// Replace the recording webhook with this:
app.post('/api/twilio/recording', async (req, res) => {
  console.log('Recording webhook called:', req.body);
  
  try {
    const { RecordingSid, CallSid, RecordingUrl, RecordingDuration, RecordingStatus } = req.body;
    
    if (RecordingStatus === 'completed') {
      // Store recording info in database
      const { data, error } = await supabase
        .from('call_recordings')
        .insert({
          call_sid: CallSid,
          recording_sid: RecordingSid,
          recording_url: RecordingUrl,
          duration: RecordingDuration,
          status: 'completed'
        });
      
      if (error) {
        console.error('Error storing recording:', error);
      } else {
        console.log('Recording stored successfully');
        
        // Trigger transcription (we'll implement this next)
        await transcribeRecording(RecordingSid, CallSid);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in recording webhook:', error);
    res.status(500).send('Error');
  }
});

// Add this function after the recording webhook:
async function transcribeRecording(recordingSid, callSid) {
  try {
    console.log(`Starting transcription for recording ${recordingSid}`);
    
    // Use the correct Twilio API for transcriptions
    const recording = await twilio.recordings(recordingSid)
      .transcriptions
      .create();
    
    console.log('Transcription created:', recording.sid);
    
    // Store transcription in database
    const { error } = await supabase
      .from('call_transcripts')
      .insert({
        call_sid: callSid,
        recording_sid: recordingSid,
        transcription_sid: recording.sid,
        status: 'processing'
      });
    
    if (error) {
      console.error('Error storing transcription:', error);
    }
    
  } catch (error) {
    console.error('Error creating transcription:', error);
  }
}

// Replace the token endpoint with this API Key approach:
app.post('/api/twilio/token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('=== TOKEN GENERATION ===');
    console.log('User ID:', userId);
    console.log('App SID:', process.env.VITE_TWILIO_APP_SID);
    console.log('Account SID:', process.env.VITE_TWILIO_ACCOUNT_SID);
    console.log('API Key SID:', process.env.VITE_TWILIO_API_KEY_SID);
    console.log('API Key Secret exists:', !!process.env.VITE_TWILIO_API_KEY_SECRET); // NEW
    console.log('API Key Secret length:', process.env.VITE_TWILIO_API_KEY_SECRET?.length); // NEW
    
    // Manual JWT generation using jsonwebtoken
    const jwt = await import('jsonwebtoken');
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      jti: `${userId || 'user'}-${now}`,
      grants: {
        identity: userId || 'user',
        voice: {
          incoming: { allow: true },
          outgoing: { application_sid: process.env.VITE_TWILIO_APP_SID }
        }
      },
      iat: now,
      exp: now + 3600, // 1 hour
      iss: process.env.VITE_TWILIO_API_KEY_SID,
      sub: process.env.VITE_TWILIO_ACCOUNT_SID
    };

    const token = jwt.default.sign(payload, process.env.VITE_TWILIO_API_KEY_SECRET, {
      algorithm: 'HS256',
      header: {
        cty: 'twilio-fpa;v=1'
      }
    });

    console.log('Generated JWT token successfully');
    console.log('Token length:', token.length);
    
    res.json({ accessToken: token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.post('/api/twilio/message', (req, res) => {
  console.log('Message webhook received:', req.body);
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We'll get back to you soon!</Message>
</Response>`;
  
  res.type('text/xml');
  res.send(twiml);
});

app.post('/api/twilio/transcription', async (req, res) => {
  console.log('Transcription webhook called:', req.body);
  
  try {
    const { TranscriptionSid, TranscriptionText, TranscriptionStatus } = req.body;
    
    if (TranscriptionStatus === 'completed') {
      // Update transcription in database
      const { error } = await supabase
        .from('call_transcripts')
        .update({
          transcript_text: TranscriptionText,
          status: 'completed'
        })
        .eq('transcription_sid', TranscriptionSid);
      
      if (error) {
        console.error('Error updating transcription:', error);
      } else {
        console.log('Transcription completed and stored');
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in transcription webhook:', error);
    res.status(500).send('Error');
  }
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
