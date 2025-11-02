import React, { useState } from "react";
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

export default function ManagerSchedules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { showSuccess, showInfo } = useNotificationHelpers();
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [newSchedule, setNewSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
    routeId: "",
    driverId: "",
    vehicleId: "",
  });

  const [editSchedule, setEditSchedule] = useState({
    id: "",
    date: "",
    startTime: "",
    endTime: "",
    routeId: "",
    driverId: "",
    vehicleId: "",
    status: "",
  });

  const { system } = useNotificationHelpers();

  const schedules = [
    {
      id: "LT001",
      date: "2024-12-19",
      startTime: "07:00",
      endTime: "17:00",
      route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
      driver: "Nguyễn Văn Minh",
      vehicle: "29A-12345",
      status: "active",
      studentsCount: 42,
    },
    {
      id: "LT002",
      date: "2024-12-20",
      startTime: "06:30",
      endTime: "16:30",
      route: "Tuyến 2: Bến xe An Sương - Trường THCS Lê Quý Đôn",
      driver: "Trần Văn Hùng",
      vehicle: "29A-67890",
      status: "scheduled",
      studentsCount: 38,
    },
    {
      id: "LT003",
      date: "2024-12-21",
      startTime: "07:15",
      endTime: "17:15",
      route: "Tuyến 3: Chợ Bình Tây - Trường THPT Marie Curie",
      driver: "Lê Thị Lan",
      vehicle: "29A-11111",
      status: "scheduled",
      studentsCount: 45,
    },
    {
      id: "LT004",
      date: "2024-12-18",
      startTime: "07:00",
      endTime: "17:00",
      route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
      driver: "Nguyễn Văn Minh",
      vehicle: "29A-12345",
      status: "completed",
      studentsCount: 40,
    },
  ];

  const routes = [
    { id: "R001", name: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du" },
    { id: "R002", name: "Tuyến 2: Bến xe An Sương - Trường THCS Lê Quý Đôn" },
    { id: "R003", name: "Tuyến 3: Chợ Bình Tây - Trường THPT Marie Curie" },
  ];

  const drivers = [
    { id: "TX001", name: "Nguyễn Văn Minh" },
    { id: "TX002", name: "Trần Văn Hùng" },
    { id: "TX003", name: "Lê Thị Lan" },
    { id: "TX004", name: "Phạm Văn Đức" },
  ];

  const vehicles = [
    { id: "XE001", plate: "29A-12345", brand: "Hyundai Universe" },
    { id: "XE002", plate: "29A-67890", brand: "Thaco Universe" },
    { id: "XE003", plate: "29A-11111", brand: "Hyundai County" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang thực hiện</Badge>
        );
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Đã lên lịch</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehicle.includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || schedule.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateSchedule = () => {
    console.log("Creating schedule:", newSchedule);
    system.dataCreated("Lịch trình mới");
    setIsCreateDialogOpen(false);
    setNewSchedule({
      date: "",
      startTime: "",
      endTime: "",
      routeId: "",
      driverId: "",
      vehicleId: "",
    });
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setEditSchedule({
      id: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      routeId: schedule.route,
      driverId: schedule.driver,
      vehicleId: schedule.vehicle,
      status: schedule.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = () => {
    console.log("Updating schedule:", editSchedule);
    system.dataUpdated(`Lịch trình ${editSchedule.id}`);
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
  };

  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSchedule = () => {
    console.log("Deleting schedule:", selectedSchedule);
    system.dataDeleted(`Lịch trình ${selectedSchedule.id}`);
    setIsDeleteDialogOpen(false);
    setSelectedSchedule(null);
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
                  <Plus className="w-4 h-4 mr-2" />
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
                        value={newSchedule.startTime}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            startTime: e.target.value,
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
                        value={newSchedule.endTime}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Tuyến đường</Label>
                      <Select
                        value={newSchedule.routeId}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, routeId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tuyến đường" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name}
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
                        value={newSchedule.driverId}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, driverId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tài xế" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Xe buýt</Label>
                      <Select
                        value={newSchedule.vehicleId}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, vehicleId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn xe buýt" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.plate} - {vehicle.brand}
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tuyến đường, tài xế, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang thực hiện</SelectItem>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
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
              {filteredSchedules.map((schedule) => (
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
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate font-medium">{schedule.route}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {schedule.driver}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4" />
                      {schedule.vehicle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {schedule.studentsCount} HS
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
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
      </Card>

      {/* Weekly Schedule View */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch trình tuần này</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[
              "Thứ 2",
              "Thứ 3",
              "Thứ 4",
              "Thứ 5",
              "Thứ 6",
              "Thứ 7",
              "Chủ nhật",
            ].map((day, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h4 className="font-medium text-center mb-2">{day}</h4>
                <div className="space-y-2">
                  {schedules
                    .filter(
                      (s) => new Date(s.date).getDay() === (index + 1) % 7
                    )
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-2 bg-blue-50 rounded text-xs"
                      >
                        <p className="font-medium">{schedule.startTime}</p>
                        <p className="text-muted-foreground truncate">
                          {schedule.route.split(":")[0]}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa lịch trình: {selectedSchedule?.id}
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
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
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
                  value={editSchedule.startTime}
                  onChange={(e) =>
                    setEditSchedule({
                      ...editSchedule,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-time">Giờ kết thúc</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={editSchedule.endTime}
                  onChange={(e) =>
                    setEditSchedule({
                      ...editSchedule,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-route">Tuyến đường</Label>
              <Select
                value={editSchedule.routeId}
                onValueChange={(value) =>
                  setEditSchedule({ ...editSchedule, routeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tuyến đường" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.name}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-driver">Tài xế</Label>
                <Select
                  value={editSchedule.driverId}
                  onValueChange={(value) =>
                    setEditSchedule({ ...editSchedule, driverId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.name}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle">Xe</Label>
                <Select
                  value={editSchedule.vehicleId}
                  onValueChange={(value) =>
                    setEditSchedule({ ...editSchedule, vehicleId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.plate}>
                        {vehicle.plate} - {vehicle.brand}
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
