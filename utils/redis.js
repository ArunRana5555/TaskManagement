const { client } = require("../config/db");

const setCache = async (key, value, ttl = 60) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis Set Error:", err);
  }
};

const getCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis Get Error:", err);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await client.del(key);
  } catch (err) {
    console.error("Redis Delete Error:", err);
  }
};

module.exports = { setCache, getCache, deleteCache };
