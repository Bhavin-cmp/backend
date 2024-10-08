const asynceHandler = (requestHandlet) => {
  (req, res, next) => {
    Promise.resolve(requestHandlet(req, res, next)).catch((err) => next(err));
  };
};

export { asynceHandler };

/* const asynceHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
}; */
