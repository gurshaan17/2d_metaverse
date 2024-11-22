import { useParams } from "react-router-dom";
import CanvasGame from "./Game";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { DoorOpen, MessageCircle, Share2, UsersRound } from "lucide-react";
import { io } from "socket.io-client";
import VideoCall from './VideoCall';
const backendUrl = import.meta.env.VITE_BACKENDURL;

function JoinSpace() {
  const { spaceId } = useParams();
  const { user, isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [chatMembers, setChatMembers] = useState([]);
  const [chat, setChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  useEffect(() => {
    // if (!isLoading && !isAuthenticated) {
    //   navigate('/');
    // }
    if (user && spaceId) {
      const Socket = io(`${backendUrl}`);
      setSocket(Socket);
      Socket.on('connect', () => {
        console.log("Chat connected");
        Socket.emit("chatConnect", {
          name: user.given_name + " " + user.family_name,
          profile: user.picture,
          spaceId: spaceId
        });
      });

      Socket.on("chatMembers", (data) => {
        console.log(data);
        setChatMembers(data);
      });

      Socket.on("userJoined", (newMember) => {
        setChatMembers(prevMembers => [...prevMembers, newMember]);
      });

      Socket.on("userDisconnected", (userId) => {
        setChatMembers(prevMembers => prevMembers.filter(member => member.id !== userId));
      });

      return () => {
        if (Socket) {
          Socket.disconnect();
        }
      };
    }
  }, [isLoading, navigate, user, spaceId]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (msg) => {
        console.log("Message received from server:", msg);
        setChatMessages((prevMessages) => [...prevMessages, msg]);
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function switchChat(value) {
    if (value) {
      setChat(true);
    } else {
      setChat(!chat);
    }
  }

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      const chatMessage = {
        sender: `${user.given_name} ${user.family_name}`,
        message,
        timestamp: new Date().toLocaleTimeString(),
        roomId: spaceId,
        profile: user.picture
      };
      socket.emit("sendMessage", chatMessage);
      setChatMessages((prevMessages) => [...prevMessages, chatMessage]);
      setMessage("");
      console.log(chatMessage);
    }
  };

  const handleVideoCall = () => {
    setIsVideoCallOpen(true);
  };

  return (
    <div className='flex flex-col w-screen h-screen'>
      <div className="w-[100%] h-[5%] bg-[#1E2031] flex justify-between items-center p-3">
        <Share2 size={24} className="text-gray-400 m-2 cursor-pointer" onClick={() => navigator.clipboard.writeText(window.location.href)} />
        <span className="text-lg text-gray-400">New Space</span>
        <span className="text-sm text-gray-300">{`Space ID ${spaceId}`}</span>
      </div>
      <div className="h-[92%] w-screen flex">
        <div className="w-[75%] bg-yellow-300">
          {user && spaceId && (
            <CanvasGame
              name={user.given_name + " " + user.family_name}
              gameId={spaceId}
            />
          )}
        </div>
        <div className="w-[25%] bg-[#202540]">
          {chat ? (
            <div className="flex flex-col h-full">
              <div className="w-[95%] justify-between items-center flex">
                <span className="p-3 text-xl text-gray-400 font-bold">Chat</span>
                <span onClick={() => { switchChat(); }} className="text-lg text-gray-300 cursor-pointer">X</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <img
                      src={msg.profile}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-300">
                          {msg.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#1E2031] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-gray-800 text-gray-300 p-2 rounded-lg"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center">
              <DoorOpen size={48} className="text-gray-400 mb-4" />
              <span className="text-lg text-gray-400">No chat available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinSpace;