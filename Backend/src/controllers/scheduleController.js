const Schedule = require("../models/schedule");
const User = require("../models/user");
const Route = require("../models/route");
const Bus = require("../models/bus");

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách lịch trình thành công.",
      DT: schedules,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Lịch trình không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin lịch trình thành công.",
      DT: schedule,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getScheduleByDriverId = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const schedules = await Schedule.findAll({
      where: { driver_id: driverId },
    });
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách lịch trình của tài xế thành công.",
      DT: schedules,
    });
  } catch (error) {
    console.error("Lỗi lấy lịch trình của tài xế:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { date, start_time, end_time, route_id, bus_id, driver_id } =
      req.body;

    if (
      !date ||
      !start_time ||
      !end_time ||
      !route_id ||
      !bus_id ||
      !driver_id
    ) {
      return res.status(400).json({
        EC: 1,
        EM: "Thiếu thông tin bắt buộc để tạo lịch trình.",
        DT: null,
      });
    }

    const driver = await User.findOne({
      where: { id: driver_id, role: "driver" },
    });
    if (!driver) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tài xế không tồn tại.", DT: null });
    }

    const route = await Route.findByPk(route_id);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }

    const bus = await Bus.findByPk(bus_id);
    if (!bus) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Xe buýt không tồn tại.", DT: null });
    }

    const schedule = await Schedule.create({
      date,
      start_time,
      end_time,
      route_id,
      bus_id,
      driver_id,
    });

    res
      .status(201)
      .json({ EC: 0, EM: "Thêm lịch trình thành công", DT: schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm lịch trình", DT: null });
  }
};

exports.editSchedule = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Lịch trình không tồn tại.", DT: null });
    }
    await schedule.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật lịch trình thành công.", DT: schedule });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ EC: -1, EM: "Không thể cập nhật lịch trình", DT: null });
  }
};

exports.editScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { date, time, route_id, bus_id, driver_id } = req.body;
    const schedule = await Schedule.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Lịch trình không tồn tại.", DT: null });
    }
    schedule.date = date || schedule.date;
    schedule.time = time || schedule.time;
    schedule.route_id = route_id || schedule.route_id;
    schedule.bus_id = bus_id || schedule.bus_id;
    schedule.driver_id = driver_id || schedule.driver_id;
    await schedule.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin lịch trình thành công.",
      DT: schedule,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.body;
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Lịch trình không tồn tại.", DT: null });
    }
    await schedule.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa lịch trình thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Lịch trình không tồn tại.", DT: null });
    }
    await schedule.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa lịch trình thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
