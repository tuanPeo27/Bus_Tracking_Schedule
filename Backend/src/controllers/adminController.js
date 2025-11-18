const User = require("../models/user");

exports.getAdminById = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await User.findOne({
      where: { id: adminId, role: "admin" },
      attributes: ["id", "username", "email", "address", "phone_number", "sex"],
    });
    if (!admin) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Quản lý không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin quản lý thành công.",
      DT: admin,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin quản lý:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Thiếu tên quản lý hoặc mật khẩu.", DT: null });
    }

    const user = await User.findOne({ where: { username } });
    if (user) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Tên quản lý đã tồn tại.", DT: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await User.create({
      username: username,
      password_hash: hashedPassword,
      role: "admin",
    });
    res.status(201).json({ EC: 0, EM: "Thêm quản lý thành công", DT: driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm quản lý", DT: null });
  }
};

exports.editAdminById = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { email, address, phone_number, sex } = req.body;

    const admin = await User.findOne({
      where: { id: adminId, role: "admin" },
    });
    if (!admin) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Phụ huynh không tồn tại.", DT: null });
    }
    admin.email = email || admin.email;
    admin.address = address || admin.address;
    admin.phone_number = phone_number || admin.phone_number;
    admin.sex = sex || admin.sex;
    await admin.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin phụ huynh thành công.",
      DT: admin,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin phụ huynh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
