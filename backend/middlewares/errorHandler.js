export const errorHandler = (err, req, res, next) => {
  console.error("Server Error Intercepted:", err.stack || err.message || err);
  
  const status = err.status || 500;
  
  return res.status(status).json({
    message: err.message || "An unexpected server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

export default errorHandler;
