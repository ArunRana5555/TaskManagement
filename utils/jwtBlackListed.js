// For assignment: simple in-memory blacklist. For production use Redis TTL store.
const blacklist = new Set();

const add = (token) => {
  blacklist.add(token);
};

const isBlacklisted = async (token) => blacklist.has(token);

module.exports = { add, isBlacklisted };
