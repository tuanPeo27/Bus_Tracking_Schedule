const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: { role: "driver" },
      attributes: ["id", "username", "email", "address", "phone_number", "sex"],
    });

    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách tài xế thành công.",
      DT: drivers,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách tài xế:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;
    const driver = await User.findOne({
      where: { id: driverId, role: "driver" },
      attributes: ["id", "username", "email", "address", "phone_number", "sex"],
    });
    if (!driver) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tài xế không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin tài xế thành công.",
      DT: driver,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin tài xế:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Thiếu tên tài xế hoặc mật khẩu.", DT: null });
    }

    const user = await User.findOne({ where: { username } });
    if (user) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Tên tài xế đã tồn tại.", DT: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await User.create({
      username: username,
      password_hash: hashedPassword,
      role: "driver",
    });
    res.status(201).json({ EC: 0, EM: "Thêm tài xế thành công", DT: driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm tài xế", DT: null });
  }
};

exports.editDriver = async (req, res) => {
  try {
    const { username, email, address, phone_number, sex } = req.body;
    const driver = await User.findOne({ where: { username, role: "driver" } });
    if (!driver) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Không tìm thấy tài xế", DT: null });
    }

    driver.email = email || driver.email;
    driver.address = address || driver.address;
    driver.phone_number = phone_number || driver.phone_number;
    driver.sex = sex || driver.sex;

    await driver.save();
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật tài xế thành công", DT: driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể cập nhật", DT: null });
  }
};

exports.editDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { email, address, phone_number, sex } = req.body;

    const driver = await User.findOne({
      where: { id: driverId, role: "driver" },
    });
    if (!driver) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tài xế không tồn tại.", DT: null });
    }
    driver.email = email || driver.email;
    driver.address = address || driver.address;
    driver.phone_number = phone_number || driver.phone_number;
    driver.sex = sex || driver.sex;

    await driver.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin tài xế thành công.",
      DT: driver,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin tài xế:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
