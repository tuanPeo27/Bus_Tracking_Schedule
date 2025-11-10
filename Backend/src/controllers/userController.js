const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SECRET_KEY = "bus_tracking_secret";

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt:", username);
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Không tìm thấy người dùng.", DT: null });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ EC: 1, EM: "Sai mật khẩu.", DT: null });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      EC: 0,
      EM: "Đăng nhập thành công!",
      DT: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      EC: -1,
      EM: "Lỗi server khi đăng nhập.",
      DT: null,
    });
  }
};

exports.forgotPass = async (req, res) => {
  try {
    const { username, prePassword, newPassword } = req.body;

    if (!username || !prePassword || !newPassword) {
      return res.status(400).json({
        EC: 1,
        EM: "Thiếu email hoặc mật khẩu cũ hoặc mật khẩu mới.",
        DT: null,
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy người dùng với email này.",
        DT: null,
      });
    }

    const validPassword = await bcrypt.compare(prePassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ EC: 1, EM: "Sai mật khẩu cũ.", DT: null });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashedPassword });

    res.status(200).json({
      EC: 0,
      EM: "Đặt lại mật khẩu thành công!",
      DT: null,
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({
      EC: -1,
      EM: "Lỗi server khi đặt lại mật khẩu.",
      DT: null,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Người dùng không tồn tại.", DT: null });
    }

    await user.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa người dùng thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Người dùng không tồn tại.", DT: null });
    }
    await user.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa người dùng thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
