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
import { Avatar, AvatarFallback } from "../ui/avatar";
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
import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  UserCheck,
  Search,
  Plus,
  Edit,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Bus,
  Trash2,
  Save,
  Eye,
} from "lucide-react";

export default function ManagerDrivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    birthDate: "",
    gender: "Nam",
    licenseNumber: "",
    phone: "",
  });
  const { showSuccess, showInfo, showError } = useNotificationHelpers();

  const drivers = [
    {
      id: "TX001",
      name: "Nguyễn Văn Minh",
      birthDate: "1985-03-15",
      gender: "Nam",
      licenseNumber: "B2-123456789",
      phone: "0912345678",
      status: "active",
      currentVehicle: "29A-12345",
      currentRoute: "Tuyến 1",
      totalTrips: 245,
      onTimeRate: 96.5,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "TX002",
      name: "Trần Văn Hùng",
      birthDate: "1990-08-22",
      gender: "Nam",
      licenseNumber: "B2-987654321",
      phone: "0987654321",
      status: "active",
      currentVehicle: "29A-67890",
      currentRoute: "Tuyến 2",
      totalTrips: 189,
      onTimeRate: 94.2,
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: "TX003",
      name: "Lê Thị Lan",
      birthDate: "1988-12-10",
      gender: "Nữ",
      licenseNumber: "B2-456789123",
      phone: "0923456789",
      status: "break",
      currentVehicle: "29A-11111",
      currentRoute: "Tuyến 3",
      totalTrips: 312,
      onTimeRate: 98.1,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "TX004",
      name: "Phạm Văn Đức",
      birthDate: "1982-05-18",
      gender: "Nam",
      licenseNumber: "B2-789123456",
      phone: "0934567890",
      status: "offline",
      currentVehicle: null,
      currentRoute: null,
      totalTrips: 428,
      onTimeRate: 92.7,
      lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        );
      case "break":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Nghỉ giải lao</Badge>
        );
      case "offline":
        return <Badge className="bg-gray-100 text-gray-800">Ngoại tuyến</Badge>;
      case "incident":
        return <Badge className="bg-red-100 text-red-800">Sự cố</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2);
  };

  const formatLastActive = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes} phút trước`;
    return `${hours} giờ trước`;
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm)
  );

  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "active").length,
    onBreak: drivers.filter((d) => d.status === "break").length,
    offline: drivers.filter((d) => d.status === "offline").length,
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsEditDialogOpen(true);
  };

  const handleAddDriver = () => {
    setNewDriver({
      name: "",
      birthDate: "",
      gender: "Nam",
      licenseNumber: "",
      phone: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveNewDriver = () => {
    if (!newDriver.name || !newDriver.licenseNumber || !newDriver.phone) {
      showError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Kiểm tra trùng lặp giấy phép lái xe
    const existingDriver = drivers.find(
      (d) => d.licenseNumber === newDriver.licenseNumber
    );
    if (existingDriver) {
      showError("Số giấy phép lái xe đã tồn tại trong hệ thống");
      return;
    }

    // Kiểm tra trùng lặp số điện thoại
    const existingPhone = drivers.find((d) => d.phone === newDriver.phone);
    if (existingPhone) {
      showError("Số điện thoại đã được sử dụng bởi tài xế khác");
      return;
    }

    // Tạo tài xế mới
    const driverData = {
      ...newDriver,
      id: `TX${String(drivers.length + 1).padStart(3, "0")}`,
      status: "offline",
      currentVehicle: null,
      currentRoute: null,
      totalTrips: 0,
      onTimeRate: 0,
      lastActive: new Date(),
    };

    // Trong ứng dụng thực, sẽ gọi API để lưu vào database
    console.log("Thêm tài xế mới:", driverData);

    showSuccess(`Đã thêm tài xế ${newDriver.name} thành công`);
    setIsAddDialogOpen(false);
    setNewDriver({
      name: "",
      birthDate: "",
      gender: "Nam",
      licenseNumber: "",
      phone: "",
    });
  };

  const handleDeleteDriver = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      // Kiểm tra nếu tài xế đang hoạt động
      if (driver.status === "active") {
        showError(
          "Không thể xóa tài xế đang hoạt động. Vui lòng chuyển tài xế về trạng thái offline trước"
        );
        return;
      }

      // Trong ứng dụng thực, sẽ gọi API để xóa
      console.log("Xóa tài xế:", driverId);
      showInfo(`Đã xóa tài xế ${driver.name}`);
    }
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateDriver = () => {
    console.log("Updating driver:", selectedDriver);
    showSuccess(
      "Cập nhật thành công",
      `Thông tin tài xế ${selectedDriver?.name} đã được cập nhật!`
    );
    setIsEditDialogOpen(false);
    setSelectedDriver(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tài xế</p>
                <p className="font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="font-semibold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nghỉ giải lao</p>
                <p className="font-semibold">{stats.onBreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngoại tuyến</p>
                <p className="font-semibold">{stats.offline}</p>
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
              <UserCheck className="w-5 h-5" />
              Quản lý Tài xế
            </CardTitle>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddDriver}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài xế
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã tài xế, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài xế</TableHead>
                <TableHead>Thông tin cơ bản</TableHead>
                <TableHead>Phân công hiện tại</TableHead>
                <TableHead>Hiệu suất</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(driver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {driver.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(driver.birthDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span>({driver.gender})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-3 h-3" />
                        <span>{driver.licenseNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {driver.currentVehicle && driver.currentRoute ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span className="font-medium">
                            {driver.currentRoute}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Xe: {driver.currentVehicle}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa phân công
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{driver.totalTrips}</span>{" "}
                        chuyến
                      </div>
                      <div className="text-sm">
                        Đúng giờ:{" "}
                        <span className="font-medium text-green-600">
                          {driver.onTimeRate}%
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(driver.status)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatLastActive(driver.lastActive)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDriver(driver)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(driver)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Phân bố tài xế theo tuyến</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Tuyến 1", "Tuyến 2", "Tuyến 3"].map((route, index) => {
                const routeDrivers = drivers.filter(
                  (d) => d.currentRoute === route
                );
                return (
                  <div
                    key={route}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{route}</p>
                      <p className="text-sm text-muted-foreground">
                        {routeDrivers.length} tài xế được phân công
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {routeDrivers.slice(0, 3).map((driver) => (
                        <Avatar
                          key={driver.id}
                          className="w-8 h-8 border-2 border-white"
                        >
                          <AvatarFallback className="text-xs">
                            {getInitials(driver.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {routeDrivers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs">
                          +{routeDrivers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa thông tin tài xế: {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân và trạng thái hoạt động của tài xế.
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Họ và tên</Label>
                  <Input id="edit-name" defaultValue={selectedDriver.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Số điện thoại</Label>
                  <Input id="edit-phone" defaultValue={selectedDriver.phone} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-birth">Ngày sinh</Label>
                  <Input
                    id="edit-birth"
                    type="date"
                    defaultValue={selectedDriver.birthDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-license">Số bằng lái</Label>
                  <Input
                    id="edit-license"
                    defaultValue={selectedDriver.licenseNumber}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select defaultValue={selectedDriver.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="break">Nghỉ giải lao</SelectItem>
                      <SelectItem value="offline">Ngoại tuyến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-route">Tuyến đường</Label>
                  <Select defaultValue={selectedDriver.currentRoute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tuyến đường" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tuyến 1">Tuyến 1</SelectItem>
                      <SelectItem value="Tuyến 2">Tuyến 2</SelectItem>
                      <SelectItem value="Tuyến 3">Tuyến 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateDriver}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết tài xế</DialogTitle>
            <DialogDescription>
              Xem thông tin đầy đủ và hiệu suất làm việc của tài xế.
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedDriver.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedDriver.name}
                  </h3>
                  <p className="text-muted-foreground">{selectedDriver.id}</p>
                  {getStatusBadge(selectedDriver.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Thông tin cá nhân</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Sinh:{" "}
                        {new Date(selectedDriver.birthDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDriver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedDriver.licenseNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Phân công hiện tại</h4>
                  <div className="space-y-2">
                    {selectedDriver.currentRoute &&
                      selectedDriver.currentVehicle ? (
                      <>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedDriver.currentRoute}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedDriver.currentVehicle}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa phân công
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Hiệu suất</h4>
                  <div className="text-2xl font-semibold">
                    {selectedDriver.totalTrips}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tổng số chuyến
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Tỷ lệ đúng giờ</h4>
                  <div className="text-2xl font-semibold text-green-600">
                    {selectedDriver.onTimeRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Đánh giá xuất sắc
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Hoạt động gần đây</h4>
                <p className="text-sm text-muted-foreground">
                  Hoạt động cuối: {formatLastActive(selectedDriver.lastActive)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm tài xế mới</DialogTitle>
            <DialogDescription>
              Nhập đầy đủ thông tin để thêm tài xế mới vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-name"
                  placeholder="Nguyễn Văn A"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-phone"
                  placeholder="0912345678"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-birth">Ngày sinh</Label>
                <Input
                  id="new-birth"
                  type="date"
                  value={newDriver.birthDate}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, birthDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-gender">Giới tính</Label>
                <Select
                  value={newDriver.gender}
                  onValueChange={(value) =>
                    setNewDriver({ ...newDriver, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-license">
                Số bằng lái <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-license"
                placeholder="B2-123456789"
                value={newDriver.licenseNumber}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, licenseNumber: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveNewDriver}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài xế
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
