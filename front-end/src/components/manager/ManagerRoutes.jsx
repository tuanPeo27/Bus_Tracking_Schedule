import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { motion } from "motion/react";
import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  Bus,
  Search,
  Plus,
  Edit,
  Wrench,
  Gauge,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Save,
  X,
  Eye,
  MapPin
} from "lucide-react";
import { LeafletMap } from "../map/LeafletMap";
import { getAllRoute, getBusStopByRouteId, createRoute, createBusStop, updateRoute, updateBusStop, deleteBusStop, deleteRoute, getAllSchedule } from "../../service/adminService";

export default function ManagerRoutes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [stopPoints, setStopPoints] = useState([]); // array: {lat, lng}
  const [allRoute, setAllRoute] = useState([]);
  const [newRoute, setNewRoute] = useState({
    id: "",
    name: "",
    start_point: "",
    end_point: "",
  });
  const getAllRoutes = async () => {
    try {
      const res = await getAllRoute();
      const dataRoute = Array.isArray(res.data) ? res.data : res.data?.DT || [];
      if (res?.data?.EC === 0) {
        const getInfoRoute = await Promise.all(
          dataRoute.map(async (item) => {
            const busStopInfo = await getBusStopByRouteId(item.id);
            return { ...item, busStopInfo };
          })
        );
        setAllRoute(getInfoRoute);
        console.log(getInfoRoute);
      } else {
        setAllRoute([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tuyến đường:", error);
      setAllRoute([]);
    }
  };
  const handleMapClick = (pt) => {
    setStopPoints((prev) => [
      ...prev,
      {
        lat: pt.lat,
        lng: pt.lng,
        name: `Trạm ${prev.length + 1}`,
        order_index: prev.length + 1,
      },
    ]);
  };

  const handleAddRoute = async () => {
    if (!newRoute.name || !newRoute.start_point || !newRoute.end_point) {
      showError("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!stopPoints || stopPoints.length === 0) {
      showError("Lỗi", "Vui lòng chọn ít nhất 1 điểm dừng trên bản đồ!");
      return;
    }

    try {
      // 1) Tạo route
      const res = await createRoute({
        name: newRoute.name,
        start_point: newRoute.start_point,
        end_point: newRoute.end_point,
      });

      const resData = res?.data || {};
      // tìm id theo các cấu trúc trả về phổ biến
      const createdRoute =
        resData?.DT || resData || {};
      const routeId = createdRoute?.id || createdRoute?.route?.id || createdRoute?.DT?.id;

      if (!routeId) {
        showError("Lỗi", "Không lấy được id tuyến sau khi tạo.");
        return;
      }

      // 2) Tạo từng bus stop (gọi API createBusStop)
      const stopPromises = stopPoints.map((s, idx) =>
        createBusStop({
          route_id: routeId,
          name: s.name || `Trạm ${idx + 1}`,
          latitude: String(s.lat),
          longitude: String(s.lng),
          order_index: s.order_index || idx + 1,
        }).catch((err) => ({ __error: err }))
      );

      const results = await Promise.all(stopPromises);
      const failed = results.filter((r) => r && r.__error);

      if (failed.length > 0) {
        showError("Cảnh báo", `Tạo tuyến thành công nhưng ${failed.length} điểm dừng không lưu được.`);
      } else {
        showSuccess("Thành công", "Đã tạo tuyến và tất cả điểm dừng.");
      }

      // reset và reload
      setNewRoute({ id: "", name: "", start_point: "", end_point: "" });
      setStopPoints([]);
      setIsAddDialogOpen(false);
      await getAllRoutes();
    } catch (error) {
      console.error("handleAddRoute error:", error);
      showError("Lỗi", error?.message || "Không thể tạo tuyến.");
    }
  }

  useEffect(() => {
    getAllRoutes();

  }, [])


  const { showSuccess, showInfo, showError } = useNotificationHelpers();

  const filteredRoutes = allRoute.filter((route) => {
    const matchesSearch =
      route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_point.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });






  // STATE và hàm cho Edit Route
  const [isRouteEditOpen, setIsRouteEditOpen] = useState(false);
  const [routeEdit, setRouteEdit] = useState(null); // { id, name, start_point, end_point }
  const [editStopPoints, setEditStopPoints] = useState([]); // array: { id?, lat, lng, name, order_index }
  const [removedStopIds, setRemovedStopIds] = useState([]); // ids to delete on save

  // Delete dialog state (mirror ManagerParent)
  const [isDeleteRouteDialogOpen, setIsDeleteRouteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  // helper: lấy mảng stops từ route.busStopInfo (tùy cấu trúc response)
  const extractStops = (busStopInfo) => {
    const maybe = busStopInfo?.data?.DT || busStopInfo?.data || busStopInfo?.DT || busStopInfo;
    return Array.isArray(maybe) ? maybe : [];
  };

  const openRouteEditor = (route) => {
    // populate route fields
    setRouteEdit({
      id: route.id,
      name: route.name || "",
      start_point: route.start_point || "",
      end_point: route.end_point || "",
    });

    // map existing stops -> editStopPoints
    const rawStops = extractStops(route.busStopInfo);
    const mapped = (rawStops || []).map((s, i) => ({
      id: s.id || s.ID || s.bus_stop_id || null,
      lat: Number(s.latitude || s.lat),
      lng: Number(s.longitude || s.lng),
      name: s.name || `Trạm ${i + 1}`,
      order_index: s.order_index || i + 1,
    }));
    setEditStopPoints(mapped);
    setRemovedStopIds([]);
    setIsRouteEditOpen(true);
  };

  // map click trong edit dialog -> thêm điểm dừng mới
  const handleEditMapClick = (pt) => {
    setEditStopPoints((prev) => [
      ...prev,
      { lat: pt.lat, lng: pt.lng, name: `Trạm ${prev.length + 1}`, order_index: prev.length + 1 },
    ]);
  };



  // xóa điểm dừng trong edit dialog
  const handleRemoveEditStop = (index) => {
    setEditStopPoints((prev) => {
      const removed = prev[index];
      if (removed && removed.id) setRemovedStopIds((r) => [...r, removed.id]);
      return prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order_index: i + 1 }));
    });
  };

  // Lưu thay đổi tuyến + stops lên backend
  const handleSaveEditedRoute = async () => {
    if (!routeEdit || !routeEdit.id) {
      showError("Lỗi", "Không có tuyến để cập nhật.");
      return;
    }
    if (!routeEdit.name || !routeEdit.start_point || !routeEdit.end_point) {
      showError("Lỗi", "Vui lòng điền đầy đủ thông tin tuyến.");
      return;
    }
    if (!editStopPoints || editStopPoints.length === 0) {
      showError("Lỗi", "Vui lòng thêm ít nhất 1 điểm dừng cho tuyến.");
      return;
    }

    try {
      // 1) cập nhật route
      // sử dụng service updateRoute
      const updRouteRes = await updateRoute(
        {
          name: routeEdit.name,
          start_point: routeEdit.start_point,
          end_point: routeEdit.end_point,
        },
        routeEdit.id
      );
      const updData = updRouteRes?.data || updRouteRes || {};
      if (!((updData?.EC !== undefined && updData.EC === 0) || updRouteRes?.status === 200 || updRouteRes?.ok)) {
        throw new Error(updData?.EM || `Cập nhật tuyến thất bại`);
      }

      // 2) xử lý stops: update tồn tại, tạo mới, xóa đã đánh dấu
      const stopPromises = [];

      editStopPoints.forEach((s, idx) => {
        const body = {
          name: s.name,
          latitude: String(s.lat),
          longitude: String(s.lng),
          order_index: s.order_index || idx + 1,
        };
        if (s.id) {
          // update existing using adminService.updateBusStop
          stopPromises.push(
            updateBusStop(body, s.id).catch((err) => Promise.reject(err))
          );
        } else {
          // create new using adminService.createBusStop
          stopPromises.push(createBusStop({ route_id: routeEdit.id, ...body }).catch((err) => Promise.reject(err)));
        }
      });

      // xóa các stop đã bị remove (sử dụng adminService.deleteBusStop)
      removedStopIds.forEach((id) => {
        stopPromises.push(deleteBusStop(id).catch((err) => Promise.reject(err)));
      });

      const results = await Promise.allSettled(stopPromises);
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length > 0) {
        console.warn("Một số thao tác điểm dừng lỗi:", rejected);
        showError("Cảnh báo", "Cập nhật tuyến xong nhưng một số điểm dừng không cập nhật được.");
      } else {
        showSuccess("Thành công", "Đã cập nhật tuyến và điểm dừng.");
      }

      setIsRouteEditOpen(false);
      setRouteEdit(null);
      setEditStopPoints([]);
      setRemovedStopIds([]);
      await getAllRoutes();
    } catch (err) {
      console.error("Lỗi khi lưu cập nhật tuyến:", err);
      showError("Lỗi", err?.message || "Không thể lưu thay đổi tuyến.");
    }
  };

  // Mở dialog xóa (sẽ hiện dialog confirm)
  const openDeleteRouteDialog = (route) => {
    setRouteToDelete(route);
    setIsDeleteRouteDialogOpen(true);
  };

  // Thực hiện xóa sau khi người dùng xác nhận trong dialog
  const confirmDeleteRoute = async () => {
    if (!routeToDelete || !routeToDelete.id) {
      showError("Lỗi", "Không có tuyến để xóa.");
      setIsDeleteRouteDialogOpen(false);
      setRouteToDelete(null);
      return;
    }

    try {
      // --- NEW: kiểm tra xem có lịch trình tham chiếu tới route này không ---
      const schedulesRes = await getAllSchedule();
      const schedulesData = Array.isArray(schedulesRes?.data) ? schedulesRes.data : (schedulesRes?.data?.DT || []);
      const referencing = (schedulesData || []).filter((s) => String(s.route_id) === String(routeToDelete.id));
      if (referencing.length > 0) {
        showError("Không thể xóa", `Tuyến đang có ${referencing.length} lịch trình liên quan. Vui lòng xóa hoặc chuyển các lịch trình đó trước khi xóa tuyến.`);
        setIsDeleteRouteDialogOpen(false);
        setRouteToDelete(null);
        return;
      }

      const routeId = routeToDelete.id;
      // 1) Lấy danh sách điểm dừng của tuyến
      const stopsRes = await getBusStopByRouteId(routeId);
      const stops = (stopsRes?.data?.DT) || (stopsRes?.data) || [];

      // 2) Xóa tất cả điểm dừng (song song)
      const deleteStopPromises = (stops || []).map((s) => {
        const id = s.id || s.ID || s.bus_stop_id;
        if (!id) return Promise.resolve({ skipped: true });
        return deleteBusStop(id).catch((err) => ({ __error: err, id }));
      });
      const stopResults = await Promise.allSettled(deleteStopPromises);
      const stopFailed = stopResults.filter(r => r.status === "rejected" || (r.value && r.value.__error));

      // 3) Xóa route
      const delRouteRes = await deleteRoute(routeId);
      const delData = delRouteRes?.data || delRouteRes || {};
      const routeDeleted = (delData?.EC !== undefined && delData.EC === 0) || delRouteRes?.status === 200 || delRouteRes?.ok;

      if (!routeDeleted) {
        console.warn("delete route response:", delRouteRes);
        showError("Lỗi", "Không xóa được tuyến. Vui lòng thử lại.");
      } else {
        if (stopFailed.length > 0) {
          showError("Cảnh báo", `Đã xóa tuyến nhưng ${stopFailed.length} điểm dừng không xóa được.`);
        } else {
          showSuccess("Thành công", "Đã xóa tuyến và các điểm dừng liên quan.");
        }
        await getAllRoutes();
      }
    } catch (err) {
      console.error("Lỗi khi xóa tuyến:", err);
      showError("Lỗi", err?.message || "Xảy ra lỗi khi xóa tuyến.");
    } finally {
      setIsDeleteRouteDialogOpen(false);
      setRouteToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tuyến đường</p>
                <p className="font-semibold">{allRoute?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Quản lý Tuyến đường
            </CardTitle>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tuyến đường
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên tuyến, điểm bắt đầu, điểm kết thúc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã tuyến</TableHead>
                <TableHead>Tên tuyến</TableHead>
                <TableHead>Điểm bắt đầu</TableHead>
                <TableHead>Điểm kết thúc</TableHead>
                <TableHead>Điểm dừng</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id} className="transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-medium">{route?.id}</p>

                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{route?.name}</p>

                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{route?.start_point}</p>

                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{route?.end_point}</p>

                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{route?.busStopInfo?.data?.DT["length"]}</p>

                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRouteEditor(route);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteRouteDialog(route);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Maintenance Alerts */}

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm tuyến đường mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để thêm tuyến đường mới vào hệ thống
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nameRoute">Tên tuyến</Label>
              <Input
                id="nameRoute"
                value={newRoute.name}
                onChange={(e) =>
                  setNewRoute((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="VD: Tuyến số 1"
              />
            </div>

            <div>
              <Label htmlFor="startPoint">Điểm bắt đầu</Label>
              <Input
                id="startPoint"
                value={newRoute.start_point}
                onChange={(e) =>
                  setNewRoute((prev) => ({ ...prev, start_point: e.target.value }))
                }
                placeholder="VD: Đại học Sài Gòn"
              />
            </div>

            <div>
              <Label htmlFor="endPoint">Điểm kết thúc</Label>
              <Input
                id="endPoint"
                value={newRoute.end_point}
                onChange={(e) =>
                  setNewRoute((prev) => ({ ...prev, end_point: e.target.value }))
                }
                placeholder="VD: Bến xe Quận 8"
              />
            </div>


            <div className="p-4 space-y-4">
              <Label>Số điểm dừng</Label>
              {/* Nút bấm: Text và chức năng thay đổi theo trạng thái showMap */}
              <Button
                type="button"
                className="w-full justify-center"
                variant={showMap ? 'outline' : 'default'}
                onClick={() => setShowMap((prev) => !prev)}
              >
                {showMap ? "Ẩn bản đồ" : "Mở bản đồ & Bấm để chọn điểm dừng"}
              </Button>

              {/* Phần bản đồ chỉ hiển thị khi showMap là true */}
              {showMap && (
                <div className="mt-4 border rounded overflow-hidden">
                  <LeafletMap
                    height="400px"
                    zoom={15}
                    markers={stopPoints.map((p, i) => ({
                      position: { lat: p.lat, lng: p.lng },
                      title: p.name || `Trạm ${i + 1}`,
                      draggable: false,

                    }))}
                    onMapClick={handleMapClick}
                  />
                  <div className="p-3">
                    <Label>Số điểm dừng: {stopPoints.length}</Label>
                    <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {stopPoints.map((p, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <div className="text-sm font-medium">#{idx + 1} — {p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                            <input
                              className="border rounded px-2 py-1 mt-1 text-sm w-56"
                              value={p.name || `Trạm ${idx + 1}`}
                              onChange={(e) => {
                                const v = e.target.value;
                                setStopPoints(prev => prev.map((s, i) => i === idx ? { ...s, name: v } : s));
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setStopPoints(prev => prev.filter((_, i) => i !== idx));
                            }}>Xóa</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setStopPoints([])}>Xóa tất cả</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddRoute}>
              <Save className="w-4 h-4 mr-2" />
              Thêm tuyến
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Vehicle Details Dialog */}

      {/* Edit Route Dialog */}
      <Dialog open={isRouteEditOpen} onOpenChange={setIsRouteEditOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tuyến đường</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tuyến đường và các điểm dừng
            </DialogDescription>
          </DialogHeader>

          {routeEdit && (
            <div className="space-y-4">
              {/* Route Info (same as Add) */}
              <div>
                <Label htmlFor="editRouteName">Tên tuyến</Label>
                <Input
                  id="editRouteName"
                  value={routeEdit.name}
                  onChange={(e) =>
                    setRouteEdit((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Tuyến 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStartPoint">Điểm bắt đầu</Label>
                  <Input
                    id="editStartPoint"
                    value={routeEdit.start_point}
                    onChange={(e) =>
                      setRouteEdit((prev) => ({ ...prev, start_point: e.target.value }))
                    }
                    placeholder="VD: Bến xe Mỹ Đình"
                  />
                </div>

                <div>
                  <Label htmlFor="editEndPoint">Điểm kết thúc</Label>
                  <Input
                    id="editEndPoint"
                    value={routeEdit.end_point}
                    onChange={(e) =>
                      setRouteEdit((prev) => ({ ...prev, end_point: e.target.value }))
                    }
                    placeholder="VD: Bến xe Lương Yên"
                  />
                </div>
              </div>

              {/* Stops section - mirror Add UI */}
              <div className="p-4 space-y-4">
                <Label>Số điểm dừng</Label>
                <Button
                  type="button"
                  className="w-full justify-center"
                  variant={showMap ? "outline" : "default"}
                  onClick={() => setShowMap((prev) => !prev)}
                >
                  {showMap ? "Ẩn bản đồ" : "Mở bản đồ & Bấm để chọn điểm dừng"}
                </Button>

                {showMap && (
                  <div className="mt-4 border rounded overflow-hidden">
                    <LeafletMap
                      height="400px"
                      zoom={15}
                      markers={editStopPoints.map((p, i) => ({
                        position: { lat: p.lat, lng: p.lng },
                        title: p.name || `Trạm ${i + 1}`,
                        draggable: false,

                      }))}
                      onMapClick={handleEditMapClick}
                    />
                    <div className="p-3">
                      <Label>Số điểm dừng: {editStopPoints.length}</Label>
                      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {editStopPoints.map((p, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <div className="text-sm font-medium">#{idx + 1} — {p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                              <input
                                className="border rounded px-2 py-1 mt-1 text-sm w-56"
                                value={p.name || `Trạm ${idx + 1}`}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditStopPoints(prev => prev.map((s, i) => i === idx ? { ...s, name: v } : s));
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleRemoveEditStop(idx)}>Xóa</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setRemovedStopIds(editStopPoints.filter(s => s.id).map(s => s.id)); setEditStopPoints([]); }}>Xóa tất cả</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRouteEditOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveEditedRoute}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Route Dialog */}
      <Dialog open={isDeleteRouteDialogOpen} onOpenChange={setIsDeleteRouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tuyến</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa tuyến và tất cả điểm dừng liên quan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Bạn có chắc chắn muốn xóa tuyến{" "}
                <strong>{routeToDelete?.name || routeToDelete?.id}</strong>? Hành động này không thể hoàn tác.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteRouteDialogOpen(false); setRouteToDelete(null); }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRoute}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>

  );
}
