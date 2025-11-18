const Bus = require("../models/bus");
const Schedule = require("../models/schedule");
const Route = require("../models/route");

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

exports.getBusByDriverId = async (req, res) => {
  try {
    const driverId = req.params.id;

    const schedule = await Schedule.findOne({
      where: { driver_id: driverId },
      attributes: [
        "id",
        "date",
        "status",
        "start_time",
        "end_time",
        "route_id",
        "bus_id",
        "driver_id",
      ],
    });

    if (!schedule) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy lịch làm việc của tài xế.",
        DT: null,
      });
    }

    const route = await Route.findByPk(schedule.route_id);

    const bus = await Bus.findByPk(schedule.bus_id);

    if (!bus) {
      return res.status(404).json({
        EC: 1,
        EM: "Xe buýt không tồn tại.",
        DT: null,
      });
    }

    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin xe buýt thành công.",
      DT: {
        bus,
        schedule,
        route,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin xe buýt:", error);
    res.status(500).json({
      EC: -1,
      EM: "Lỗi server khi lấy thông tin xe buýt.",
      DT: null,
    });
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
