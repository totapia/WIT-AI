import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';

export const useTwilioVoice = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const deviceRef = useRef<Device | null>(null);

  // Initialize Twilio Device
  const initializeDevice = async (accessToken: string) => {
    try {
      const newDevice = new Device(accessToken, {
        logLevel: 0, // Changed from 1 to 0 to reduce logs
        codecPreferences: ['opus', 'pcmu'] as any
      });

      // Set up event listeners
      newDevice.on('registered', () => {
        console.log('✅ Twilio Device registered');
        setIsConnected(true);
      });

      newDevice.on('error', (error) => {
        console.error('❌ Twilio Device error:', error);
        setIsConnected(false);
      });

      newDevice.on('incoming', (incomingCall) => {
        console.log('📞 Incoming call:', incomingCall);
        setCall(incomingCall);
      });

      // Set device state immediately, before registering
      setDevice(newDevice);
      deviceRef.current = newDevice;

      await newDevice.register();
    } catch (error) {
      console.error('Failed to initialize Twilio Device:', error);
    }
  };

  // Make an outbound call
  const makeCall = async (phoneNumber: string) => {
    // Use deviceRef instead of device state to avoid timing issues
    const currentDevice = deviceRef.current;
    if (!currentDevice) {
      throw new Error('Device not initialized');
    }

    try {
      const newCall = await currentDevice.connect({
        params: {
          To: phoneNumber
          // Remove the From parameter - let Twilio handle it
        }
      });

      setCall(newCall);
      setupCallListeners(newCall);
      return newCall;
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  };

  // Set up call event listeners
  const setupCallListeners = (callInstance: any) => {
    callInstance.on('accept', () => {
      console.log('✅ Call accepted');
      setIsConnected(true);
    });

    callInstance.on('disconnect', () => {
      console.log('📞 Call disconnected');
      setCall(null);
      setIsConnected(false);
      setIsMuted(false);
      setIsOnHold(false);
    });

    callInstance.on('cancel', () => {
      console.log('❌ Call cancelled');
      setCall(null);
      setIsConnected(false);
    });

    callInstance.on('reject', () => {
      console.log('❌ Call rejected');
      setCall(null);
      setIsConnected(false);
    });
  };

  // Call controls
  const muteCall = () => {
    if (call) {
      call.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const holdCall = () => {
    if (call) {
      if (isOnHold) {
        call.unhold();
      } else {
        call.hold();
      }
      setIsOnHold(!isOnHold);
    }
  };

  const hangupCall = () => {
    if (call) {
      call.disconnect();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
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
