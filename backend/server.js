const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);

// --- Simplified CORS Configuration for Debugging ---
app.use(cors()); // Allow all origins for HTTP requests

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
    methods: ["GET", "POST"]
  },
});
// ----------------------------------------------------

app.use(express.json());
app.set('io', io);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 4000; // Use Render's port
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await sequelize.sync();
  console.log('✅ Database synchronized!');
});

io.on('connection', (socket) => {
  console.log('🔌 Admin dashboard connected:', socket.id);
});