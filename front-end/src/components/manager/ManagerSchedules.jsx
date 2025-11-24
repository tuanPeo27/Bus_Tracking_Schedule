import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Cookies from "js-cookie";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";

import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Route,
  Bus,
  User,
} from "lucide-react";
import { createSchedule, deleteSchedule, getAllBus, getAllDriver, getAllRoute, getAllSchedule, getInfoBus, getInfoDriver, getInfoRoute, getInfoStudentByRouteId, updateSchedule } from "../../service/adminService";

export default function ManagerSchedules() {
  const { system, showError } = useNotificationHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { showSuccess, showInfo } = useNotificationHelpers();
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [allSchedule, setAllSchedule] = useState([]);
  const [listRoute, setListRoute] = useState([]);
  const [listDriver, setListDriver] = useState([]);
  const [listBus, setListBus] = useState([]);
  const [filterRoute, setFilterRoute] = useState("all");
  const [filterDriver, setFilterDriver] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage, setSchedulesPerPage] = useState(10);



  const getAllSchedules = async () => {
    try {
      const res = await getAllSchedule();
      const dataSchedule = Array.isArray(res.data) ? res.data : res.data?.DT || [];

      if (res?.data?.EC === 0) {
        const infoSchedule = await Promise.all(
          dataSchedule.map(async (item) => {
            const routeInfo = await getInfoRoute(item.route_id);
            const driverInfo = await getInfoDriver(item.driver_id);
            const busInfo = await getInfoBus(item.bus_id);
            const studentInfo = await getInfoStudentByRouteId(item.route_id);
            return { ...item, routeInfo, driverInfo, busInfo, studentInfo };
          })
        );
        setAllSchedule(infoSchedule);
        console.log(infoSchedule);
      } else {
        setAllSchedule([]);
      }

    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch trình:", error);
      setAllSchedule([]);
    }
  };


  const fetchRoutes = async () => {
    try {
      const res = await getAllRoute();
      const data = res?.data;
      if (data && data.EC === 0 && Array.isArray(data.DT)) {
        setListRoute(data.DT);
      } else {
        console.error("Lỗi khi lấy dữ liệu tuyến đường:", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi mạng khi lấy tuyến đường:", error.message);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await getAllDriver();
      const data = res?.data;
      if (data && data.EC === 0 && Array.isArray(data.DT)) {
        setListDriver(data.DT);
      } else {
        console.error("Lỗi khi lấy dữ liệu tài xế:", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi mạng khi lấy tài xế:", error.message);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await getAllBus();
      const data = res?.data;
      if (data && data.EC === 0 && Array.isArray(data.DT)) {
        setListBus(data.DT);
      } else {
        console.error("Lỗi khi lấy dữ liệu xe bus:", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi mạng khi lấy xe bus:", error.message);
    }
  };


  useEffect(() => {
    getAllSchedules();
    fetchRoutes();
    fetchBuses();
    fetchDrivers();
    setCurrentPage(1);
  }, [searchTerm, filterRoute, filterDriver, filterStatus]);
  const [newSchedule, setNewSchedule] = useState({
    id: "",
    bus_id: "",
    driver_id: "",
    route_id: "",
    start_time: "",
    end_time: "",
    date: "",
    status: "scheduled",

  });

  const [editSchedule, setEditSchedule] = useState({
    id: "",
    bus_id: "",
    driver_id: "",
    route_id: "",
    start_time: "",
    end_time: "",
    date: "",
    status: "",
  });

  const filteredSchedules = allSchedule.filter((schedule) => {
    const matchesSearch =
      (schedule.routeInfo?.data?.DT?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (schedule.routeInfo?.data?.DT?.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (schedule.routeInfo?.data?.DT?.end_point.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (schedule.driverInfo?.data?.DT?.username.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (schedule.busInfo?.data?.DT?.brand.includes(searchTerm.toLowerCase()) ?? false) ||
      (schedule.busInfo?.data?.DT?.model.includes(searchTerm.toLowerCase()) ?? false);

    const matchesDriver =
      filterDriver === "all" || schedule.driver_id === filterDriver;
    const matchesRoute =
      filterRoute === "all" || schedule.route_id === filterRoute;
    const matchesStatus =
      filterStatus === "all" || schedule.status === filterStatus;

    return matchesSearch && matchesDriver && matchesRoute && matchesStatus;
  });

  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
  const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreateSchedule = async () => {
    if (
      !newSchedule.bus_id ||
      !newSchedule.driver_id ||
      !newSchedule.route_id ||
      !newSchedule.end_time ||
      !newSchedule.start_time ||
      !newSchedule.date
    ) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      await createSchedule(newSchedule);
      console.log("Creating schedule:", newSchedule);
      system.dataCreated("Lịch trình mới");
      setIsCreateDialogOpen(false);
      setNewSchedule({
        date: "",
        start_time: "",
        end_time: "",
        route_id: "",
        bus_id: "",
        driver_id: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo lịch trình:", error);
      showError("Không thể tạo lịch trình. Vui lòng thử lại!");
    }

    await getAllSchedules();

  };

  const handleEditSchedule = (newSchedule) => {
    setSelectedSchedule(newSchedule);
    setEditSchedule({
      id: newSchedule.id,
      date: newSchedule.date,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      route_id: newSchedule.route_id,
      driver_id: newSchedule.driver_id,
      bus_id: newSchedule.bus_id,
      status: newSchedule.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = async () => {
    try {
      await updateSchedule(editSchedule, editSchedule.id);
      console.log("Updating schedule:", editSchedule);
      system.dataUpdated(`Lịch trình ${editSchedule.id}`);
      setIsEditDialogOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa lịch trình:", error);
      showError("Không thể chỉnh sửa lịch trình. Vui lòng thử lại!");
    }
    await getAllSchedules();
  };

  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSchedule = async () => {
    try {
      await deleteSchedule(selectedSchedule.id);
      console.log("Deleting schedule:", selectedSchedule);
      system.dataDeleted(`Lịch trình ${selectedSchedule.id}`);
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa lịch trình:", error);
      showError("Không thể chỉnh sửa lịch trình. Vui lòng thử lại!");
    }
    await getAllSchedules();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Đang tiến hành</Badge>
        );
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Lên lịch</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quản lý Lịch trình
            </CardTitle>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Tạo lịch trình mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo lịch trình mới</DialogTitle>
                  <DialogDescription>
                    Tạo lịch trình vận hành mới cho xe buýt trường học.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ngày thực hiện</Label>
                      <Input
                        type="date"
                        value={newSchedule.date}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Thời gian bắt đầu</Label>
                      <Input
                        type="time"
                        value={newSchedule.start_time}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            start_time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Thời gian kết thúc</Label>
                      <Input
                        type="time"
                        value={newSchedule.end_time}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            end_time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Tuyến đường</Label>
                      <Select
                        value={newSchedule.route_id}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, route_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tuyến đường" />
                        </SelectTrigger>
                        <SelectContent>
                          {listRoute.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name}: {route.start_point} - {route.end_point}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tài xế</Label>
                      <Select
                        value={newSchedule.driver_id}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, driver_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tài xế" />
                        </SelectTrigger>
                        <SelectContent>
                          {listDriver.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Xe buýt</Label>
                      <Select
                        value={newSchedule.bus_id}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, bus_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn xe buýt" />
                        </SelectTrigger>
                        <SelectContent>
                          {listBus.map((bus) => (
                            <SelectItem key={bus.id} value={bus.id}>
                              {bus.brand} {bus.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateSchedule} className="flex-1">
                      Tạo lịch trình
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tuyến đường, tài xế, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <Select value={filterRoute} onValueChange={setFilterRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo tuyến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tuyến</SelectItem>
                  {listRoute.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}: {route.start_point} - {route.end_point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={filterDriver} onValueChange={setFilterDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo tài xế" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tài xế</SelectItem>
                {listDriver.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>

                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="in_progress">Đang tiến hành</SelectItem>
                  <SelectItem value="scheduled">Lên lịch</SelectItem>
                </SelectContent>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lịch trình</TableHead>
                <TableHead>Ngày & Thời gian</TableHead>
                <TableHead>Tuyến đường</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead>Xe</TableHead>
                <TableHead>Học sinh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                currentSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Không tìm thấy lịch trình nào
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) :
                  (currentSchedules.length > 0 ? currentSchedules : allSchedule).map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Badge variant="outline">{schedule.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(schedule.date).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate font-medium">
                            {schedule.routeInfo?.data?.DT?.name}: {schedule.routeInfo?.data?.DT?.start_point} - {schedule.routeInfo?.data?.DT?.end_point}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {schedule.driverInfo?.data?.DT?.driver?.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4" />
                          {schedule.busInfo?.data?.DT?.brand}-{schedule.busInfo?.data?.DT?.model}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {schedule.studentInfo?.data?.DT["length"]} HS
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule?.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteSchedule(schedule)}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center p-4 border-t">

            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              {/* Chèn khoảng trắng */}
              <div className="w-6 shrink-0"></div>

              <span className="text-sm font-medium">
                Trang {currentPage} / {totalPages}
              </span>

              {/* Chèn khoảng trắng */}
              <div className="w-6 shrink-0"></div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}

      </Card>



      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa lịch trình: {editSchedule.id}
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lịch trình và phân công tài xế, xe buýt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Ngày</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editSchedule.date}
                  onChange={(e) =>
                    setEditSchedule({ ...editSchedule, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={editSchedule.status}
                  onValueChange={(value) =>
                    setEditSchedule({ ...editSchedule, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Lên lịch</SelectItem>
                    <SelectItem value="in_progress">Đang tiến hành</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-time">Giờ bắt đầu</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={editSchedule.start_time}
                  onChange={(e) =>
                    setEditSchedule({
                      ...editSchedule,
                      start_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-time">Giờ kết thúc</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={editSchedule.end_time}
                  onChange={(e) =>
                    setEditSchedule({
                      ...editSchedule,
                      end_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-route">Tuyến đường</Label>
              <Select
                value={editSchedule.route_id}
                onValueChange={(value) =>
                  setEditSchedule({ ...editSchedule, route_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tuyến đường" />
                </SelectTrigger>
                <SelectContent>
                  {listRoute.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}: {route.start_point} - {route.end_point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-driver">Tài xế</Label>
                <Select
                  value={editSchedule.driver_id}
                  onValueChange={(value) =>
                    setEditSchedule({ ...editSchedule, driver_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {listDriver.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle">Xe</Label>
                <Select
                  value={editSchedule.bus_id}
                  onValueChange={(value) =>
                    setEditSchedule({ ...editSchedule, bus_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {listBus.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.brand} {bus.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateSchedule}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa lịch trình</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa vĩnh viễn lịch trình đã chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Bạn có chắc chắn muốn xóa lịch trình{" "}
                <strong>{selectedSchedule?.id}</strong>?
                <br />
                Hành động này không thể hoàn tác.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSchedule}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
