const mongoose = require('mongoose');
const { createClient } = require('redis');

async function connectDB(uri) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected...');
}

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
  try {
    await client.connect();
    console.log('Redis connected...');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

module.exports = { connectDB, client };
