const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Use the simple CORS configuration
app.use(cors());

// A simple test route for the root
app.get('/', (req, res) => {
  res.send('Backend test server is running!');
});

// A simple test route for the exact path that is failing
app.get('/api/participants', (req, res) => {
  res.json({ message: 'Participants route is working correctly!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});