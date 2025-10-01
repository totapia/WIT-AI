import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress Twilio internal messages to reduce console noise
const originalConsoleLog = console.log;
console.log = (...args) => {
  const message = args.join(' ');
  
  // Filter out Twilio internal messages
  if (message.includes('[TwilioVoice][WSTransport]') ||
      message.includes('[TwilioVoice][Device]') ||
      message.includes('[TwilioVoice][EventPublisher]') ||
      message.includes('[TwilioVoice][PeerConnection]') ||
      message.includes('[TwilioVoice][AudioHelper]') ||
      message.includes('[TwilioVoice][PStream]') ||
      message.includes('[TwilioVoice][Call]') ||
      message.includes('[TwilioVoice][OutputDeviceCollection]') ||
      message.includes('[TwilioVoice][AudioProcessorEventObserver]') ||
      message.includes('Publishing insights') ||
      message.includes('Set logger default level') ||
      message.includes('ICE Candidate:') ||
      message.includes('signalingState is') ||
      message.includes('dtlsTransportState is') ||
      message.includes('pc.iceGatheringState is') ||
      message.includes('pc.iceConnectionState is') ||
      message.includes('pc.connectionState is') ||
      message.includes('Media connection established') ||
      message.includes('Disconnecting...') ||
      message.includes('stopping default device stream') ||
      message.includes('Received HANGUP from gateway') ||
      message.includes('Received: {"payload"') ||
      message.includes('WebSocket opened successfully') ||
      message.includes('Setting token and publishing listen') ||
      message.includes('sorting codecs') ||
      message.includes('setting sorted codecs') ||
      message.includes('Creating AudioProcessorEventObserver') ||
      message.includes('Initializing preferred transport') ||
      message.includes('Initializing primary transport') ||
      message.includes('WSTransport.open() called') ||
      message.includes('Attempting to connect') ||
      message.includes('Closing and cleaning up WebSocket') ||
      message.includes('No WebSocket to clean up') ||
      message.includes('Publishing cancelled') ||
      message.includes('Opening default device with constraints') ||
      message.includes('Opened default device') ||
      message.includes('Updating available devices') ||
      message.includes('selected-ice-candidate-pair') ||
      message.includes('ice-candidate') ||
      message.includes('network-change') ||
      message.includes('get-user-media') ||
      message.includes('connection') ||
      message.includes('settings') ||
      message.includes('signaling-state') ||
      message.includes('dtls-transport-state') ||
      message.includes('ice-gathering-state') ||
      message.includes('ice-connection-state') ||
      message.includes('pc-connection-state') ||
      message.includes('endpointName":"EndpointEvents"') ||
      message.includes('Download the React DevTools')) {
    return; // Don't log these messages
  }
  
  originalConsoleLog.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
