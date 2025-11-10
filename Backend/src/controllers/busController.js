const Bus = require("../models/bus");

exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.findAll();
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách xe buýt thành công.",
      DT: buses,
    });
  } catch (error) {
    console.error("Lỗi lấy xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const busId = req.params.id;
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin xe buýt thành công.",
      DT: bus,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ EC: 0, EM: "Thêm xe buýt thành công", DT: bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm xe buýt", DT: null });
  }
};

exports.editBus = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const bus = await Bus.findByPk(id);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }
    await bus.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật xe buýt thành công.", DT: bus });
  } catch (error) {
    console.error("Lỗi cập nhật xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.editBusById = async (req, res) => {
  try {
    const busId = req.params.id;
    const updateData = req.body;
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }
    await bus.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật xe buýt thành công.", DT: bus });
  } catch (error) {
    console.error("Lỗi cập nhật xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.body;
    const bus = await Bus.findByPk(id);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }
    await bus.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa xe buýt thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteBusById = async (req, res) => {
  try {
    const busId = req.params.id;
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }
    await bus.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa xe buýt thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa xe buýt:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
