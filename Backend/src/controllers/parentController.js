const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getAllParents = async (req, res) => {
  try {
    const parents = await User.findAll({
      where: { role: "parent" },
      attributes: ["id", "username", "email", "address", "phone_number", "sex"],
    });

    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách phụ huynh thành công.",
      DT: parents,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách phụ huynh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parentId = req.params.id;
    const parent = await User.findOne({
      where: { id: parentId, role: "parent" },
      attributes: ["id", "username", "email", "address", "phone_number", "sex"],
    });
    if (!parent) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Phụ huynh không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin phụ huynh thành công.",
      DT: parent,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin phụ huynh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createParent = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Thiếu tên phụ huynh hoặc mật khẩu.", DT: null });
    }

    const user = await User.findOne({ where: { username } });
    if (user) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Tên phụ huynh đã tồn tại.", DT: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await User.create({
      username: username,
      password_hash: hashedPassword,
      role: "parent",
    });
    res
      .status(201)
      .json({ EC: 0, EM: "Thêm phụ huynh thành công", DT: parent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm phụ huynh.", DT: null });
  }
};

exports.editParent = async (req, res) => {
  try {
    const { username, email, address, phone_number, sex } = req.body;

    const parent = await User.findOne({ where: { username, role: "parent" } });
    if (!parent) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Phụ huynh không tồn tại.", DT: null });
    }
    parent.email = email || parent.email;
    parent.address = address || parent.address;
    parent.phone_number = phone_number || parent.phone_number;
    parent.sex = sex || parent.sex;

    await parent.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin phụ huynh thành công.",
      DT: parent,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin phụ huynh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.editParentById = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { email, address, phone_number, sex } = req.body;

    const parent = await User.findOne({
      where: { id: parentId, role: "parent" },
    });
    if (!parent) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Phụ huynh không tồn tại.", DT: null });
    }
    parent.email = email || parent.email;
    parent.address = address || parent.address;
    parent.phone_number = phone_number || parent.phone_number;
    parent.sex = sex || parent.sex;
    await parent.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin phụ huynh thành công.",
      DT: parent,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin phụ huynh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
