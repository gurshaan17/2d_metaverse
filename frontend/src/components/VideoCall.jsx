import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
const backendUrl = import.meta.env.VITE_BACKENDURL;

const VideoCall = ({ roomId, onClose }) => {
  const socketRef = useRef();
  const localVideoRef = useRef();
  const peerConnections = useRef({});
  const remoteVideosRef = useRef({});
  const [userNames, setUserNames] = useState({});
  const { user } = useKindeAuth();
  const localStreamRef = useRef(null);

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
        {
          urls: 'turn:relay1.expressturn.com:3478',
          username: 'efKFPWKJRENK2FKI0A',
          credential: 's6CWi8IiCbwuSNUV',
          icetransportpolicy: 'relay'
        }
      ],
      iceCandidatePoolSize: 10,
    });

    peerConnections.current[userId] = peerConnection;

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
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
      if (!remoteVideosRef.current[userId]) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('relative');
        
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.classList.add('w-48', 'h-36', 'rounded-lg', 'border', 'border-gray-600');
        
        const userNameLabel = document.createElement('span');
        userNameLabel.classList.add('absolute', 'bottom-2', 'left-2', 'text-white', 'text-sm', 'bg-black', 'bg-opacity-50', 'px-2', 'py-1', 'rounded');
        userNameLabel.innerText = userNames[userId] || 'Remote User';
        
        videoContainer.appendChild(remoteVideo);
        videoContainer.appendChild(userNameLabel);
        
        document.getElementById('remoteVideos').appendChild(videoContainer);
        remoteVideosRef.current[userId] = videoContainer;
        
        remoteVideo.play().catch(error => console.error('Error playing remote video:', error));
      }
    };

    peerConnection.onconnectionstatechange = event => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'failed') {
        peerConnection.restartIce();
      }
    };

    return peerConnection;
  };

  const initializeUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
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

  useEffect(() => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    socketRef.current = io(backendUrl);
    
    const userName = user?.given_name && user?.family_name
      ? `${user.given_name} ${user.family_name}`
      : 'Anonymous User';

    initializeUserMedia()
      .then(stream => {
        socketRef.current.emit('joinRoom', {
          roomId,
          userName
        });

        socketRef.current.on('newUser', async ({ userId, userName }) => {
          console.log('New user joined:', userId, userName);
          setUserNames(prev => ({ ...prev, [userId]: userName }));

          const peerConnection = createPeerConnection(userId);
          
          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
          });

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          socketRef.current.emit('offer', {
            sdp: offer,
            roomId,
            userId,
            userName
          });
        });

        socketRef.current.on('offer', async ({ offer, userId, userName }) => {
          console.log('Received offer from:', userId, userName);
          setUserNames(prev => ({ ...prev, [userId]: userName }));

          const peerConnection = createPeerConnection(userId);

          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
          });

          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socketRef.current.emit('answer', {
            sdp: answer,
            roomId,
            userId,
            userName
          });
        });

        socketRef.current.on('answer', async ({ answer, userId, userName }) => {
          console.log('Received answer from:', userId);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
              .catch(err => console.error('Error setting remote description:', err));
          }
        });

        socketRef.current.on('candidate', async ({ candidate, userId }) => {
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
        });

        socketRef.current.on('userDisconnected', userId => {
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
          }
          
          if (remoteVideosRef.current[userId]) {
            remoteVideosRef.current[userId].remove();
            delete remoteVideosRef.current[userId];
          }
          
          setUserNames(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        });
      })
      .catch(error => {
        console.error('Error setting up media devices:', error);
      });

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user]);

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