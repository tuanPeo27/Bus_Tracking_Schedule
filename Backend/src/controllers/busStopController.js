const BusStop = require("../models/busStop");
const Route = require("../models/route");

exports.createBusStop = async (req, res) => {
  try {
    const { route_id, name, latitude, longitude, order_index, estimated_time } =
      req.body;
    const route = await Route.findByPk(route_id);
    if (!route)
      return res.status(400).json({ EC: 1, EM: "Tuyến không tồn tại" });

    const stop = await BusStop.create({
      route_id,
      name,
      latitude,
      longitude,
      order_index,
      estimated_time,
    });
    res.status(201).json({ EC: 0, EM: "Tạo điểm dừng thành công", DT: stop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ EC: -1, EM: "Lỗi khi tạo điểm dừng" });
  }
};

exports.getBusStopsByRouteId = async (req, res) => {
  try {
    const { route_id } = req.params;
    const stops = await BusStop.findAll({
      where: { route_id },
      order: [["order_index", "ASC"]],
    });
    res
      .status(200)
      .json({ EC: 0, EM: "Lấy danh sách điểm dừng thành công", DT: stops });
  } catch (error) {
    res.status(500).json({ EC: -1, EM: "Lỗi khi lấy danh sách điểm dừng" });
  }
};

exports.editBusStop = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await BusStop.findByPk(id);
    if (!stop)
      return res.status(404).json({ EC: 1, EM: "Không tìm thấy điểm dừng" });

    await stop.update(req.body);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật điểm dừng thành công", DT: stop });
  } catch (error) {
    res.status(500).json({ EC: -1, EM: "Lỗi khi cập nhật điểm dừng" });
  }
};

exports.deleteBusStop = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await BusStop.findByPk(id);
    if (!stop)
      return res.status(404).json({ EC: 1, EM: "Không tìm thấy điểm dừng" });

    await stop.destroy();
    res.status(200).json({ EC: 0, EM: "Xóa điểm dừng thành công" });
  } catch (error) {
    res.status(500).json({ EC: -1, EM: "Lỗi khi xóa điểm dừng" });
  }
};
