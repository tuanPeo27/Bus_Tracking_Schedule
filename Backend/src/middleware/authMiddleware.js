const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "secret_key";

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      EC: -1,
      EM: "Thiếu header Authorization",
      DT: null,
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      EC: -1,
      EM: "Thiếu token đăng nhập",
      DT: null,
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT verify error:", error.message);
    return res.status(403).json({
      EC: -1,
      EM: "Token không hợp lệ hoặc đã hết hạn",
      DT: null,
    });
  }
};

exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      EC: -1,
      EM: "Chưa xác thực người dùng",
      DT: null,
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      EC: -1,
      EM: "Chỉ admin mới có quyền thực hiện hành động này",
      DT: null,
    });
  }

  console.log("Admin xác thực:", req.user.username);
  next();
};
