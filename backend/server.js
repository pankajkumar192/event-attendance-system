const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);

// --- The CORS Fix is Here ---
// We are now telling the server to allow requests ONLY from your live Vercel site.
const corsOptions = {
  origin: "https://event-attendance-system-neon.vercel.app",
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
// ----------------------------

app.use(express.json());
app.set('io', io);
app.use('/api', apiRoutes);

const PORT = 4000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await sequelize.sync();
  console.log('✅ Database synchronized!');
});

io.on('connection', (socket) => {
  console.log('🔌 Admin dashboard connected:', socket.id);
});