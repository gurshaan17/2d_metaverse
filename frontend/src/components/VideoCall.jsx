import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const VideoCall = ({ roomId, onClose }) => {
  const socketRef = useRef();
  const localVideoRef = useRef();
  const peerConnections = useRef({});
  const remoteVideosRef = useRef({});
  const [userNames, setUserNames] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const { user } = useKindeAuth();
  const localStreamRef = useRef(null);

  // Enhanced ICE server configuration
  const getICEServers = () => ({
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ]
      },
      {
        urls: 'turn:relay1.expressturn.com:3478',
        username: 'efKFPWKJRENK2FKI0A',
        credential: 's6CWi8IiCbwuSNUV'
      },
      {
        urls: 'turn:relay1.expressturn.com:443',
        username: 'efKFPWKJRENK2FKI0A',
        credential: 's6CWi8IiCbwuSNUV'
      }
    ],
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  });

  const createPeerConnection = (userId) => {
    console.log('Creating peer connection for user:', userId);
    
    const peerConnection = new RTCPeerConnection(getICEServers());
    peerConnections.current[userId] = peerConnection;

    // Monitor ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}: ${peerConnection.connectionState}`);
      setConnectionStatus(prev => ({
        ...prev,
        [userId]: peerConnection.connectionState
      }));

      if (peerConnection.connectionState === 'failed') {
        console.log('Connection failed, attempting recovery...');
        handleConnectionFailure(userId);
      }
    };

    // Monitor ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}: ${peerConnection.iceConnectionState}`);
      if (peerConnection.iceConnectionState === 'failed') {
        peerConnection.restartIce();
      }
    };

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('Sending ICE candidate for:', userId);
        socketRef.current.emit('candidate', {
          candidate: event.candidate,
          roomId,
          userId,
          userName: user?.given_name && user?.family_name
            ? `${user.given_name} ${user.family_name}`
            : 'Anonymous User'
        });
      }
    };

    peerConnection.ontrack = event => {
      console.log('Received tracks:', event.streams);
      if (!remoteVideosRef.current[userId]) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('relative');
        
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.classList.add('w-48', 'h-36', 'rounded-lg', 'border', 'border-gray-600');
        
        remoteVideo.onloadedmetadata = () => {
          console.log('Remote video metadata loaded');
          remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
        };
        
        const userNameLabel = document.createElement('span');
        userNameLabel.classList.add('absolute', 'bottom-2', 'left-2', 'text-white', 'text-sm', 'bg-black', 'bg-opacity-50', 'px-2', 'py-1', 'rounded');
        userNameLabel.innerText = userNames[userId] || 'Remote User';
        
        videoContainer.appendChild(remoteVideo);
        videoContainer.appendChild(userNameLabel);
        
        document.getElementById('remoteVideos').appendChild(videoContainer);
        remoteVideosRef.current[userId] = { container: videoContainer, video: remoteVideo };
      }
    };

    return peerConnection;
  };

  const handleConnectionFailure = async (userId) => {
    const pc = peerConnections.current[userId];
    if (pc) {
      try {
        // Close existing connection
        pc.close();
        delete peerConnections.current[userId];

        // Create new connection
        const newPc = createPeerConnection(userId);
        
        // Add local tracks
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            newPc.addTrack(track, localStreamRef.current);
          });
        }

        // Create and send new offer
        const offer = await newPc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await newPc.setLocalDescription(offer);
        
        socketRef.current.emit('offer', {
          sdp: offer,
          roomId,
          userId,
          userName: user?.given_name && user?.family_name
            ? `${user.given_name} ${user.family_name}`
            : 'Anonymous User'
        });
      } catch (error) {
        console.error('Error during connection recovery:', error);
      }
    }
  };

  const initializeUserMedia = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  // Rest of your useEffect and return statement remains the same...
  // (Previous implementation from the last response)

  // Add debugging display
  return (
    <div className="bg-[#1E2031] p-4 rounded-lg">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">Video Call</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Connection status display */}
        <div className="mb-4">
          {Object.entries(connectionStatus).map(([userId, status]) => (
            <div key={userId} className="text-sm text-gray-400">
              {userNames[userId] || 'Remote User'}: {status}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline
              className="w-48 h-36 rounded-lg border border-gray-600" 
            />
            <span className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You
            </span>
          </div>
          
          <div 
            id="remoteVideos" 
            className="flex flex-wrap gap-4"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;