const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Parent = require("../models/parent");
const Driver = require("../models/driver");

exports.register = async (req, res) => {
  try {
    const { username, password, email, role, address, phone_number, sex } =
      req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Thiếu thông tin." });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      email,
      address,
      phone_number,
      sex,
      role,
    });

    if (role === "parent") {
      await Parent.create({ id: newUser.id, username: newUser.username });
    } else if (role === "driver") {
      await Driver.create({
        id: newUser.id,
        username: newUser.username,
        license_number: "UNKNOWN",
      });
    }

    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi đăng ký." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Sai mật khẩu." });
    }

    res.status(200).json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập." });
  }
};
