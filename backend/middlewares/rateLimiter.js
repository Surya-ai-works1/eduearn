const ipRequests = new Map();

// Default limit is 100 requests per 15 minutes
export const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }

    const timestamps = ipRequests.get(ip);
    
    // Filter out timestamps older than the sliding window threshold
    const activeTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (activeTimestamps.length >= limit) {
      return res.status(429).json({
        message: "Too many requests from this IP address. Please try again later."
      });
    }

    activeTimestamps.push(now);
    ipRequests.set(ip, activeTimestamps);
    next();
  };
};

// Periodic garbage collection to remove stale IP keys and prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequests.entries()) {
    const active = timestamps.filter(time => now - time < 15 * 60 * 1000);
    if (active.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, active);
    }
  }
}, 10 * 60 * 1000).unref(); // unref prevents blocking process exits during testing

export default rateLimiter;
