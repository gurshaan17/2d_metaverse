import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

// Interfaces
interface Player {
  id: string;
  x: number;
  y: number;
  direction: string;
  name: string;
  room: string;
}

interface RoomState {
  players: Map<string, Player>;
}

interface VideoRoom {
  users: Map<string, string>; // userId -> userName
}

export const initWs = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  const gameRooms = new Map<string, RoomState>();
  const videoRooms = new Map<string, VideoRoom>();

  const getPlayersInRoom = (roomId: string): Player[] => {
    const roomState = gameRooms.get(roomId);
    return roomState ? Array.from(roomState.players.values()) : [];
  };

  const addPlayerToRoom = (roomId: string, player: Player) => {
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, { players: new Map() });
    }
    const roomState = gameRooms.get(roomId)!;
    roomState.players.set(player.id, player);
  };

  const removePlayerFromRoom = (roomId: string, playerId: string) => {
    const roomState = gameRooms.get(roomId);
    if (roomState) {
      roomState.players.delete(playerId);
      if (roomState.players.size === 0) {
        gameRooms.delete(roomId);
      }
    }
  };

  const addUserToVideoRoom = (roomId: string, userId: string, userName: string) => {
    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, { users: new Map() });
    }
    const room = videoRooms.get(roomId)!;
    room.users.set(userId, userName);
  };

  const removeUserFromVideoRoom = (roomId: string, userId: string) => {
    const room = videoRooms.get(roomId);
    if (room) {
      room.users.delete(userId);
      if (room.users.size === 0) {
        videoRooms.delete(roomId);
      }
    }
  };

  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);
    let currentGameRoom: string | null = null;
    let currentVideoRoom: string | null = null;

    // Chat Logic
    socket.on("chatConnect", (data: { name: string; profile: string; spaceId: string }) => {
      socket.join(data.spaceId);
      socket.to(data.spaceId).emit("chatMembers", getPlayersInRoom(data.spaceId));
    });

    socket.on('sendMessage', (data: { 
      sender: string;
      message: string;
      timestamp: string;
      roomId: string;
      profile: string;
    }) => {
      console.log("Broadcasting message:", data);
      socket.to(data.roomId).emit('receiveMessage', data);
    });

    // Game Logic
    socket.on("player-join", (data: { 
      name?: string;
      x?: number;
      y?: number;
      room: string;
    }) => {
      if (currentGameRoom) {
        removePlayerFromRoom(currentGameRoom, socket.id);
        socket.leave(currentGameRoom);
      }

      currentGameRoom = data.room;
      const player: Player = {
        id: socket.id,
        x: data.x || Math.random() * 1000,
        y: data.y || Math.random() * 1000,
        direction: "front",
        name: data.name || `Player ${socket.id.slice(0, 4)}`,
        room: currentGameRoom,
      };

      socket.join(currentGameRoom);
      addPlayerToRoom(currentGameRoom, player);
      socket.emit("players-sync", getPlayersInRoom(currentGameRoom));
      socket.to(currentGameRoom).emit("player-joined", player);
      console.log(`Player ${player.name} joined game room ${currentGameRoom}`);
    });

    socket.on("player-move", (data: {
      x: number;
      y: number;
      direction: string;
      room: string;
    }) => {
      const roomState = gameRooms.get(data.room);
      if (!roomState) return;

      const player = roomState.players.get(socket.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;
        socket.to(data.room).emit("player-moved", player);
      }
    });

    // Video Call Logic
    socket.on("joinRoom", (data: { roomId: string; userName: string }) => {
      const { roomId, userName } = data;
      currentVideoRoom = roomId;
      
      socket.join(roomId);
      addUserToVideoRoom(roomId, socket.id, userName);

      socket.to(roomId).emit("newUser", { 
        userId: socket.id, 
        userName 
      });

      console.log(`User ${userName} (${socket.id}) joined video room ${roomId}`);
    });

    socket.on("offer", (data: { 
      sdp: RTCSessionDescriptionInit; 
      roomId: string; 
      userId: string;
      userName: string;
    }) => {
      socket.to(data.roomId).emit("offer", { 
        offer: data.sdp, 
        userId: socket.id,
        userName: data.userName
      });
    });

    socket.on("answer", (data: { 
      sdp: RTCSessionDescriptionInit; 
      roomId: string; 
      userId: string;
      userName: string;
    }) => {
      socket.to(data.roomId).emit("answer", { 
        answer: data.sdp, 
        userId: socket.id,
        userName: data.userName
      });
    });

    socket.on("candidate", (data: { 
      candidate: RTCIceCandidateInit; 
      roomId: string; 
      userId: string;
      userName: string;
    }) => {
      socket.to(data.roomId).emit("candidate", { 
        candidate: data.candidate, 
        userId: socket.id,
        userName: data.userName
      });
    });

    // Disconnect Logic
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Clean up game room
      if (currentGameRoom) {
        socket.to(currentGameRoom).emit("player-left", socket.id);
        removePlayerFromRoom(currentGameRoom, socket.id);
        socket.to(currentGameRoom).emit("chatMembers", getPlayersInRoom(currentGameRoom));
        console.log(`Player ${socket.id} left game room ${currentGameRoom}`);
      }

      // Clean up video room
      if (currentVideoRoom) {
        removeUserFromVideoRoom(currentVideoRoom, socket.id);
        socket.to(currentVideoRoom).emit("userDisconnected", socket.id);
        console.log(`User ${socket.id} left video room ${currentVideoRoom}`);
      }
    });
  });
};