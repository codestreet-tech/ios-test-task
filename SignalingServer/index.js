const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

const PORT = 3000;

io.on('connection', (socket) => {
    const roomId = socket.handshake.query.roomId
    const username = socket.handshake.query.username
    const isCaller = socket.handshake.query.isCaller

    console.log('Client connected: ${username} -> room ${roomId}', socket.id);

    socket.join(roomId);
    socket.to(roomId).emit('room_user_joined', { username, roomId, isCaller });

    socket.on('offer', (sdp) => {
        console.log(`offer in room ${roomId}`);
        socket.to(roomId).emit('offer', sdp);
    });

    socket.on('answer', (sdp) => {
        console.log(`answer in room ${roomId}`);
        socket.to(roomId).emit('answer', sdp);
    });

    socket.on('candidate', (candidate) => {
        socket.to(roomId).emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        socket.leave(roomId);
        socket.to(roomId).emit('room_user_left', { username });
        console.log('Client disconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server listening on http://localhost:${PORT}`);
});