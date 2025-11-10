const e = require("express");
const Route = require("../models/route");

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll();
    res.status(200).json({
      EC: 0,
      EM: "Lấy danh sách tuyến đường thành công.",
      DT: routes,
    });
  } catch (error) {
    console.error("Lỗi lấy tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;
    const route = await Route.findByPk(routeId);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }
    res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin tuyến đường thành công.",
      DT: route,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res
      .status(201)
      .json({ EC: 0, EM: "Thêm tuyến đường thành công", DT: route });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ EC: -1, EM: "Không thể thêm tuyến đường", DT: null });
  }
};

exports.editRoute = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const route = await Route.findByPk(id);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }
    await route.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật tuyến đường thành công.", DT: route });
  } catch (error) {
    console.error("Lỗi cập nhật tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.editRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;
    const updateData = req.body;
    const route = await Route.findByPk(routeId);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }
    await route.update(updateData);
    res
      .status(200)
      .json({ EC: 0, EM: "Cập nhật tuyến đường thành công.", DT: route });
  } catch (error) {
    console.error("Lỗi cập nhật tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.body;
    const route = await Route.findByPk(id);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }
    await route.destroy();
    res
      .status(200)
      .json({ EC: 0, EM: "Xóa tuyến đường thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};

exports.deleteRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;
    const route = await Route.findByPk(routeId);
    if (!route) {
      return res
        .status(404)
        .json({ EC: 1, EM: "Tuyến đường không tồn tại.", DT: null });
    }
    await route.destroy();
    res
      .status(200)
      .json({ EC: 0, EM: "Xóa tuyến đường thành công.", DT: null });
  } catch (error) {
    console.error("Lỗi xóa tuyến đường:", error);
    res.status(500).json({ EC: -1, EM: "Lỗi server.", DT: null });
  }
};
