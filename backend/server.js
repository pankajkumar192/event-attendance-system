const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);

// Use a lenient CORS policy for final testing
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

app.use(express.json());
app.set('io', io);
app.use('/api', apiRoutes);

// Use Render's PORT and the required HOST binding
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, async () => {
  console.log(`🚀 Full server running on port ${PORT}`);
  await sequelize.sync();
  console.log('✅ Database synchronized!');
});

io.on('connection', (socket) => {
  console.log('🔌 Admin dashboard connected:', socket.id);
});