# 2D Metaverse

Welcome to the 2D Metaverse project! This application allows users to interact in a virtual environment, featuring video calls, chat functionality, and collaborative spaces.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Video Calling**: Users can initiate video calls with multiple participants.
- **Chat Functionality**: Send and receive messages in real-time.
- **User Presence**: See who is currently in the room and their status.
- **Dynamic User Interface**: Responsive design that adapts to different screen sizes.
- **Interactive Spaces**: Users can navigate through a 2D environment and interact with each other.

## Technologies Used

- **Frontend**: 
  - React.js
  - Tailwind CSS
  - Socket.IO for real-time communication
- **Backend**: 
  - Node.js
  - Express.js
  - Socket.IO for WebSocket communication
- **Database**: 
  - MongoDB

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gurshaan17/2d_metaverse.git
   cd 2d_metaverse
   ```

2. Install dependencies for the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```

4. Set up your environment variables (if needed) in a `.env` file.

5. Start the backend server:
   ```bash
   cd backend
   npx tsc -b
   node dist/index
   ```

6. Start the frontend application:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

- Navigate to `http://localhost:3000` in your web browser to access the application.
- Create or join a space to start interacting with other users.
- Use the chat feature to communicate with others in real-time.
- Initiate video calls to collaborate face-to-face.
