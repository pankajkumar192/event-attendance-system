const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io); // Attach io instance to app

app.use('/api', routes);

async function startServer() {
  await sequelize.sync();
  server.listen(4000, () => console.log('✅ Server running on http://localhost:4000'));
  io.on('connection', (socket) => {
    console.log('Admin dashboard connected via Socket.IO:', socket.id);
  });
}

startServer();