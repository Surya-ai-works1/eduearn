export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }
  
  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  next();
};

const validations = {
  validateRegister,
  validateLogin
};

export default validations;
