const Route = require("../models/route");
const Schedule = require("../models/schedule");
const Student = require("../models/student");
const Parent = require("../models/user");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: [
        "id",
        "name",
        "age",
        "school",
        "pickup_point",
        "dropoff_point",
        "parent_id",
        "route_id",
      ],
    });

    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách học sinh thành công.",
      DT: students,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học sinh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getStudentsByRouteId = async (req, res) => {
  try {
    const routeId = req.params.id;
    const students = await Student.findAll({
      where: { route_id: routeId },
      attributes: [
        "id",
        "name",
        "age",
        "school",
        "pickup_point",
        "dropoff_point",
        "parent_id",
        "route_id",
      ],
    });
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách học sinh theo tuyến đường thành công.",
      DT: students,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học sinh theo tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getStudentsByParentId = async (req, res) => {
  try {
    const parentId = req.params.id;
    const students = await Student.findAll({
      where: { parent_id: parentId },
      attributes: [
        "id",
        "name",
        "age",
        "school",
        "pickup_point",
        "dropoff_point",
      ],
    });
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách học sinh theo phụ huynh thành công.",
      DT: students,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học sinh theo tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      age,
      school,
      pickup_point,
      dropoff_point,
      parent_id,
      route_id,
    } = req.body;

    if (
      !name ||
      !age ||
      !school ||
      !pickup_point ||
      !dropoff_point ||
      !parent_id ||
      !route_id
    ) {
      return res
        .status(400)
        .json({ EC: 1, EM: "Thêm học sinh khóa.", DT: null });
    }

    const parent = await Parent.findByPk(parent_id);
    if (!parent) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Phụ huynh không tìm thấy.", DT: null });
    }

    const route = await Route.findByPk(route_id);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tìm thấy.", DT: null });
    }

    const student = await Student.create({
      name,
      age,
      school,
      pickup_point,
      dropoff_point,
      parent_id,
      route_id,
    });

    res
      .status(201)
      .json({ EC: 0, EM: "Thêm học sinh thành công", DT: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Không thể thêm học sinh", DT: null });
  }
};

exports.editStudent = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const student = await Student.findByPk(id);
    if (!student) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Học sinh không tồn tại.", DT: null });
    }
    await student.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật học sinh thành công.", DT: student });
  } catch (error) {
    console.error("Lỗi cập nhật học sinh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.editStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, age, school, pickup_point, dropoff_point } = req.body;
    const student = await Student.findOne({
      where: { id: studentId },
    });
    if (!student) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Học sinh không tồn tại.", DT: null });
    }
    student.name = name || student.name;
    student.age = age || student.age;
    student.school = school || student.school;
    student.pickup_point = pickup_point || student.pickup_point;
    student.dropoff_point = dropoff_point || student.dropoff_point;
    await student.save();
    res.status(200).json({
      EC: 0,
      EM: "Cập nhật thông tin học sinh thành công.",
      DT: student,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin học sinh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.body;
    const student = await Student.findByPk(id);
    if (!student) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Học sinh không tồn tại.", DT: null });
    }
    await student.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa học sinh thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa học sinh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Học sinh không tồn tại.", DT: null });
    }
    await student.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa học sinh thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa học sinh:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getStudentsByScheduleId = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    console.log("🔍 Lấy danh sách học sinh theo lịch trình:", scheduleId);

    const schedule = await Schedule.findOne({
      where: { id: scheduleId },
      attributes: ["id", "route_id", "bus_id", "driver_id"],
    });

    if (!schedule) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy lịch trình.",
        DT: null,
      });
    }

    const students = await Student.findAll({
      where: { route_id: schedule.route_id },
      attributes: [
        "id",
        "name",
        "age",
        "school",
        "pickup_point",
        "dropoff_point",
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách học sinh theo lịch trình thành công.",
      DT: {
        schedule_id: schedule.id,
        route_id: schedule.route_id,
        students: students,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học sinh theo lịch trình:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
