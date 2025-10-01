import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';

export const useTwilioVoice = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const deviceRef = useRef<Device | null>(null);

  // Enhanced debugging - CLEAN VERSION (reduced noise)
  const logCallEvent = (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`📞 [${timestamp}] ${event}`, details ? details : '');
  };

  const logStateChange = (state: string, value: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] ${state} =`, value);
  };

  // Initialize Twilio Device
  const initializeDevice = async (accessToken: string) => {
    try {
      logCallEvent('INIT: Device starting...');
      
      const newDevice = new Device(accessToken, {
        logLevel: 0, // Set to 0 to suppress heartbeat messages
        codecPreferences: ['opus', 'pcmu'] as any
      });

      // Set up event listeners
      newDevice.on('registered', () => {
        logCallEvent('✅ Device registered');
        setIsConnected(true);
      });

      newDevice.on('error', (error) => {
        logCallEvent('❌ Device error:', error);
        setIsConnected(false);
      });

      newDevice.on('incoming', (incomingCall) => {
        logCallEvent('�� Incoming call:', { 
          callSid: (incomingCall as any).sid || 'unknown',
          from: (incomingCall as any).parameters?.From 
        });
        setCall(incomingCall);
      });

      // Set device state immediately, before registering
      setDevice(newDevice);
      deviceRef.current = newDevice;

      await newDevice.register();
      logCallEvent('✅ Device registered successfully');
      
    } catch (error) {
      logCallEvent('❌ Device initialization failed:', error);
      throw error;
    }
  };

  // Make an outbound call
  const makeCall = async (phoneNumber: string) => {
    logCallEvent('📞 Making call to:', phoneNumber);
    
    const currentDevice = deviceRef.current;
    if (!currentDevice) {
      logCallEvent('❌ Device not initialized');
      throw new Error('Device not initialized');
    }

    try {
      const newCall = await currentDevice.connect({
        params: {
          To: phoneNumber
        }
      });

      logCallEvent('✅ Call created:', { 
        callSid: (newCall as any).sid || 'unknown',
        to: phoneNumber
      });
      
      setCall(newCall);
      setupCallListeners(newCall);
      
      return newCall;
    } catch (error) {
      logCallEvent('❌ Call failed:', error);
      throw error;
    }
  };

  // Set up call event listeners
  const setupCallListeners = (callInstance: any) => {
    const callSid = callInstance?.sid || 'unknown';
    logCallEvent('🔧 Setting up call listeners:', callSid);

    callInstance.on('accept', () => {
      logCallEvent('✅ Call accepted');
    });

    callInstance.on('disconnect', (disconnectReason: any) => {
      logCallEvent('📞 Call disconnected:', { 
        callSid,
        reason: disconnectReason 
      });
      setCall(null);
      setIsMuted(false);
      setIsOnHold(false);
    });

    callInstance.on('cancel', () => {
      logCallEvent('❌ Call cancelled');
      setCall(null);
    });

    callInstance.on('reject', () => {
      logCallEvent('❌ Call rejected');
      setCall(null);
    });

    callInstance.on('ringing', () => {
      logCallEvent('�� Call ringing...');
    });

    callInstance.on('warning', (name: string, data: any) => {
      logCallEvent('⚠️ Call warning:', { name, data });
    });

    callInstance.on('warning-cleared', (name: string) => {
      logCallEvent('✅ Warning cleared:', name);
    });
  };

  // Call controls
  const muteCall = () => {
    if (call) {
      const newMuteState = !isMuted;
      logCallEvent('MUTE_TOGGLE', { 
        callSid: (call as any).sid || 'unknown',
        muted: newMuteState 
      });
      call.mute(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  const holdCall = () => {
    if (call) {
      const newHoldState = !isOnHold;
      logCallEvent('HOLD_TOGGLE', { 
        callSid: (call as any).sid || 'unknown',
        onHold: newHoldState 
      });
      if (newHoldState) {
        call.hold();
      } else {
        call.unhold();
      }
      setIsOnHold(newHoldState);
    }
  };

  const hangupCall = () => {
    if (call) {
      logCallEvent('HANGUP_INITIATED', { callSid: (call as any).sid || 'unknown' });
      call.disconnect();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      logCallEvent('HOOK_CLEANUP');
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, []);

  return {
    device,
    call,
    isConnected,
    isMuted,
    isOnHold,
    initializeDevice,
    makeCall,
    muteCall,
    holdCall,
    hangupCall
  };
};
