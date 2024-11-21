import { Server, Socket } from "socket.io";
import { get, Server as HttpServer } from "http";

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

export const initWs = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track rooms and their players
  const rooms = new Map<string, RoomState>();

  const getPlayersInRoom = (roomId: string): Player[] => {
    const roomState = rooms.get(roomId);
    return roomState ? Array.from(roomState.players.values()) : [];
  };

  const addPlayerToRoom = (roomId: string, player: Player) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: new Map() });
    }
    const roomState = rooms.get(roomId)!;
    roomState.players.set(player.id, player);
  };

  const removePlayerFromRoom = (roomId: string, playerId: string) => {
    const roomState = rooms.get(roomId);
    if (roomState) {
      roomState.players.delete(playerId);
      // Clean up empty rooms
      if (roomState.players.size === 0) {
        rooms.delete(roomId);
      }
    }
  };

  io.on("connection", (socket: Socket) => {
    console.log("Player connected:", socket.id);
   //Chat Logic 
      socket.on("chatConnect", (data: { name: string; profile: string;spaceId:string }) => {
      socket.join(data.spaceId);
      socket.to(data.spaceId).emit("chatMembers", getPlayersInRoom(data.spaceId));
      });
      socket.on('sendMessage', (data: { sender:string;message:string;timestamp:string;roomId:string,profile:string}) => {
        console.log("Broadcasting message:", data);
        socket.to(data.roomId).emit('receiveMessage', data);
      });
    // Game logic
    let currentRoom: string | null = null;

    socket.on("player-join", (data: { 
      name?: string;
      x?: number;
      y?: number;
      room: string;
    }) => {
      // Leave previous room if exists
      if (currentRoom) {
        removePlayerFromRoom(currentRoom, socket.id);
        socket.leave(currentRoom);
      }

      const roomId = data.room;
      currentRoom = roomId;

      // Create player object
      const player: Player = {
        id: socket.id,
        x: data.x || Math.random() * 1000,
        y: data.y || Math.random() * 1000,
        direction: "front",
        name: data.name || `Player ${socket.id.slice(0, 4)}`,
        room: roomId,
      };

      // Join socket.io room
      socket.join(roomId);

      // Add player to room state
      addPlayerToRoom(roomId, player);

      // Send current players in room to new player
      socket.emit("players-sync", getPlayersInRoom(roomId));

      // Broadcast new player to others in room
      socket.to(roomId).emit("player-joined", player);

      console.log(`Player ${player.name} joined room ${roomId}`);
    });

    socket.on("player-move", (data: {
      x: number;
      y: number;
      direction: string;
      room: string;
    }) => {
      const roomState = rooms.get(data.room);
      if (!roomState) return;

      const player = roomState.players.get(socket.id);
      if (player) {
        // Update player position
        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;

        // Broadcast movement to others in the same room
        socket.to(data.room).emit("player-moved", player);
      }
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      
      if (currentRoom) {
        // Notify others in the room
        socket.to(currentRoom).emit("player-left", socket.id);
        
        // Remove player from room state
        removePlayerFromRoom(currentRoom, socket.id);
        socket.to(currentRoom).emit("chatMembers", getPlayersInRoom(currentRoom));
        console.log(`Player ${socket.id} left room ${currentRoom}`);
      }
    });

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('newUser', socket.id); // Notify others that a new user has joined
    });

    socket.on("offer", (data: { sdp: RTCSessionDescriptionInit; roomId: string; userId: string }) => {
      socket.to(data.roomId).emit("offer", { offer: data.sdp, userId: data.userId });
    });

    socket.on("answer", (data: { sdp: RTCSessionDescriptionInit; roomId: string; userId: string }) => {
      socket.to(data.roomId).emit("answer", { answer: data.sdp, userId: data.userId });
    });

    socket.on("candidate", (data: { candidate: RTCIceCandidateInit; roomId: string; userId: string }) => {
      socket.to(data.roomId).emit("candidate", { candidate: data.candidate, userId: data.userId });
    });
  });
};