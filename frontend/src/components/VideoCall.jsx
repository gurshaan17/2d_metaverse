import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
const backendUrl = import.meta.env.VITE_BACKENDURL;

const VideoCall = ({ roomId, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    socketRef.current = io(`${backendUrl}`);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;

        socketRef.current.emit('joinRoom', roomId);

        socketRef.current.on('newUser', ({ userId, userName }) => {
          const peerConnection = new RTCPeerConnection();
          peerConnections.current[userId] = peerConnection;

          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
          });

          socketRef.current.emit('userJoined', { id: userId, name: userName });

          peerConnection.onicecandidate = event => {
            if (event.candidate) {
              socketRef.current.emit('candidate', { candidate: event.candidate, roomId, userId });
            }
          };

          peerConnection.ontrack = event => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            remoteVideo.classList.add('w-full', 'h-auto', 'border-2', 'border-white');

            const videoContainer = document.createElement('div');
            videoContainer.classList.add('relative', 'flex', 'flex-col', 'items-start');

            videoContainer.appendChild(remoteVideo);

            const userNameLabel = document.createElement('span');
            userNameLabel.classList.add('absolute', 'bottom-0', 'left-0', 'text-white', 'bg-black', 'bg-opacity-50', 'p-1', 'rounded');
            userNameLabel.innerText = userName;
            videoContainer.appendChild(userNameLabel);

            document.getElementById('remoteVideos').appendChild(videoContainer);
            remoteVideosRef.current[userId] = videoContainer;
          };

          peerConnection.createOffer()
            .then(offer => {
              peerConnection.setLocalDescription(offer);
              socketRef.current.emit('offer', { offer, roomId, userId });
            });

          setUserNames(prev => ({ ...prev, [userId]: userName }));
        });

        socketRef.current.on('offer', (data) => {
          const peerConnection = new RTCPeerConnection();
          peerConnections.current[data.userId] = peerConnection;

          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
          });

          peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          peerConnection.createAnswer()
            .then(answer => {
              peerConnection.setLocalDescription(answer);
              socketRef.current.emit('answer', { answer, roomId, userId: data.userId });
            });

          peerConnection.onicecandidate = event => {
            if (event.candidate) {
              socketRef.current.emit('candidate', { candidate: event.candidate, roomId, userId: data.userId });
            }
          };

          peerConnection.ontrack = event => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            remoteVideo.classList.add('w-full', 'h-auto', 'border-2', 'border-white');

            const videoContainer = document.createElement('div');
            videoContainer.classList.add('relative', 'flex', 'flex-col', 'items-start');

            videoContainer.appendChild(remoteVideo);

            const userNameLabel = document.createElement('span');
            userNameLabel.classList.add('absolute', 'bottom-0', 'left-0', 'text-white', 'bg-black', 'bg-opacity-50', 'p-1', 'rounded');
            userNameLabel.innerText = userNames[data.userId];
            videoContainer.appendChild(userNameLabel);

            document.getElementById('remoteVideos').appendChild(videoContainer);
            remoteVideosRef.current[data.userId] = videoContainer;
          };
        });

        socketRef.current.on('answer', (data) => {
          peerConnections.current[data.userId].setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socketRef.current.on('candidate', (data) => {
          peerConnections.current[data.userId].addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        socketRef.current.on('userDisconnected', userId => {
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
            const videoElement = remoteVideosRef.current[userId];
            if (videoElement) {
              videoElement.remove();
              delete remoteVideosRef.current[userId];
            }
          }
        });
      });

    return () => {
      socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [roomId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <video ref={localVideoRef} autoPlay muted className="w-72 h-48 border-2 border-white mb-4" />
      <div id="remoteVideos" className="grid grid-cols-2 gap-4 w-full max-h-80 overflow-y-auto"></div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">End Call</button>
    </div>
  );
};

export default VideoCall;