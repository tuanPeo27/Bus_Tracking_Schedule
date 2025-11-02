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
} from "lucide-react";

export default function ManagerVehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([
    {
      id: "XE001",
      licensePlate: "29A-12345",
      brand: "Hyundai Universe",
      model: "2020",
      seats: 45,
      avgSpeed: 35,
      status: "active",
      assignedDriver: "Nguyễn Văn Minh",
      currentRoute: "Tuyến 1",
      fuelLevel: 85,
      mileage: 125000,
      lastMaintenance: "2024-11-15",
      nextMaintenance: "2024-12-30",
      totalTrips: 1250,
      condition: "good",
    },
    {
      id: "XE002",
      licensePlate: "29A-67890",
      brand: "Thaco Universe",
      model: "2021",
      seats: 42,
      avgSpeed: 32,
      status: "active",
      assignedDriver: "Trần Văn Hùng",
      currentRoute: "Tuyến 2",
      fuelLevel: 92,
      mileage: 98000,
      lastMaintenance: "2024-12-01",
      nextMaintenance: "2025-01-15",
      totalTrips: 980,
      condition: "excellent",
    },
    {
      id: "XE003",
      licensePlate: "29A-11111",
      brand: "Hyundai County",
      model: "2019",
      seats: 35,
      avgSpeed: 30,
      status: "break",
      assignedDriver: "Lê Thị Lan",
      currentRoute: "Tuyến 3",
      fuelLevel: 45,
      mileage: 145000,
      lastMaintenance: "2024-10-20",
      nextMaintenance: "2024-12-20",
      totalTrips: 1580,
      condition: "fair",
    },
    {
      id: "XE004",
      licensePlate: "29A-22222",
      brand: "Isuzu NQR",
      model: "2022",
      seats: 38,
      avgSpeed: 28,
      status: "maintenance",
      assignedDriver: null,
      currentRoute: null,
      fuelLevel: 0,
      mileage: 65000,
      lastMaintenance: "2024-12-18",
      nextMaintenance: "2025-02-01",
      totalTrips: 720,
      condition: "maintenance",
    },
  ]);
  // DÒNG NÀY ĐÃ ĐƯỢC SỬA: Loại bỏ cú pháp TypeScript gây lỗi "any is not defined"
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [newVehicle, setNewVehicle] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    seats: "",
    status: "active",
    condition: "good",
  });
  const { showSuccess, showInfo, showError } = useNotificationHelpers();

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        );
      case "break":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Tạm dừng</Badge>
        );
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800">Bảo trì</Badge>;
      case "breakdown":
        return <Badge className="bg-red-100 text-red-800">Hỏng hóc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Tuyệt vời</Badge>;
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Tốt</Badge>;
      case "fair":
        return <Badge className="bg-yellow-100 text-yellow-800">Khá</Badge>;
      case "poor":
        return <Badge className="bg-orange-100 text-orange-800">Kém</Badge>;
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">Bảo trì</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getFuelLevelColor = (level) => {
    if (level > 70) return "bg-green-500";
    if (level > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const isMaintenanceDue = (nextMaintenance) => {
    const nextDate = new Date(nextMaintenance);
    const now = new Date();
    const daysUntil = Math.ceil(
      (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7;
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.assignedDriver?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    breakdown: vehicles.filter((v) => v.status === "breakdown").length,
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailDialogOpen(true);
  };

  // CRUD Functions
  const handleAddVehicle = () => {
    if (
      !newVehicle.licensePlate ||
      !newVehicle.brand ||
      !newVehicle.model ||
      !newVehicle.seats
    ) {
      showError("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const vehicle = {
      id: `XE${String(vehicles.length + 1).padStart(3, "0")}`,
      licensePlate: newVehicle.licensePlate,
      brand: newVehicle.brand,
      model: newVehicle.model,
      seats: parseInt(newVehicle.seats),
      avgSpeed: 30,
      status: newVehicle.status,
      assignedDriver: null,
      currentRoute: null,
      fuelLevel: 100,
      mileage: 0,
      lastMaintenance: new Date().toISOString().split("T")[0],
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      totalTrips: 0,
      condition: newVehicle.condition,
    };

    setVehicles((prev) => [...prev, vehicle]);
    setNewVehicle({
      licensePlate: "",
      brand: "",
      model: "",
      seats: "",
      status: "active",
      condition: "good",
    });
    setIsAddDialogOpen(false);
    showSuccess("Thành công", `Đã thêm xe ${vehicle.licensePlate}!`);
  };

  const handleUpdateVehicle = () => {
    if (!selectedVehicle) return;

    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === selectedVehicle.id ? selectedVehicle : vehicle
      )
    );

    showSuccess(
      "Cập nhật thành công",
      `Thông tin xe ${selectedVehicle?.licensePlate} đã được cập nhật!`
    );
    setIsEditDialogOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    if (confirm(`Bạn có chắc chắn muốn xóa xe ${vehicle.licensePlate}?`)) {
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      showSuccess("Đã xóa", `Xe ${vehicle.licensePlate} đã được xóa!`);
    }
  };

  const handleRowClick = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setTimeout(() => setSelectedVehicleId(null), 2000); // Remove highlight after 2 seconds
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng xe buýt</p>
                <p className="font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang bảo trì</p>
                <p className="font-semibold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hỏng hóc</p>
                <p className="font-semibold">{stats.breakdown}</p>
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
              Quản lý Xe buýt
            </CardTitle>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe buýt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo biển số, hãng xe, tài xế..."
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
                <TableHead>Thông tin xe</TableHead>
                <TableHead>Phân công</TableHead>
                <TableHead>Hiệu suất</TableHead>
                <TableHead>Nhiên liệu</TableHead>
                <TableHead>Bảo trì</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVehicleId === vehicle.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleRowClick(vehicle.id)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4" />
                        <span className="font-medium">
                          {vehicle.licensePlate}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{vehicle.seats} chỗ</span>
                        <Gauge className="w-3 h-3 ml-2" />
                        <span>{vehicle.avgSpeed} km/h</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {vehicle.assignedDriver && vehicle.currentRoute ? (
                      <div className="space-y-1">
                        <p className="font-medium">{vehicle.assignedDriver}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.currentRoute}
                        </p>
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
                        <span className="font-medium">
                          {vehicle.totalTrips.toLocaleString()}
                        </span>{" "}
                        chuyến
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.mileage.toLocaleString()} km
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Nhiên liệu</span>
                        <span className="font-medium">
                          {vehicle.fuelLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getFuelLevelColor(
                            vehicle.fuelLevel
                          )}`}
                          style={{ width: `${vehicle.fuelLevel}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Cuối:{" "}
                          {new Date(vehicle.lastMaintenance).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3" />
                        <span
                          className={
                            isMaintenanceDue(vehicle.nextMaintenance)
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          Tiếp:{" "}
                          {new Date(vehicle.nextMaintenance).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      {isMaintenanceDue(vehicle.nextMaintenance) && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">
                            Sắp đến hạn!
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>{getConditionBadge(vehicle.condition)}</TableCell>

                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(vehicle);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVehicle(vehicle);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVehicle(vehicle.id);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Cảnh báo bảo trì
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicles
              .filter((v) => isMaintenanceDue(v.nextMaintenance))
              .map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium">
                      Xe {vehicle.licensePlate} sắp đến hạn bảo trì
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ngày bảo trì tiếp theo:{" "}
                      {new Date(vehicle.nextMaintenance).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Lên lịch bảo trì
                  </Button>
                </div>
              ))}

            {vehicles.filter((v) => isMaintenanceDue(v.nextMaintenance))
              .length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-medium mb-2">
                  Tất cả xe đều trong tình trạng tốt
                </h3>
                <p className="text-muted-foreground">
                  Không có xe nào cần bảo trì trong thời gian tới.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm xe buýt mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để thêm xe buýt mới vào hệ thống
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="licensePlate">Biển số xe</Label>
              <Input
                id="licensePlate"
                value={newVehicle.licensePlate}
                onChange={(e) =>
                  setNewVehicle((prev) => ({
                    ...prev,
                    licensePlate: e.target.value,
                  }))
                }
                placeholder="VD: 29A-12345"
              />
            </div>

            <div>
              <Label htmlFor="brand">Hãng xe</Label>
              <Input
                id="brand"
                value={newVehicle.brand}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, brand: e.target.value }))
                }
                placeholder="VD: Hyundai"
              />
            </div>

            <div>
              <Label htmlFor="model">Dòng xe</Label>
              <Input
                id="model"
                value={newVehicle.model}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, model: e.target.value }))
                }
                placeholder="VD: Universe"
              />
            </div>

            <div>
              <Label htmlFor="seats">Số ghế</Label>
              <Input
                id="seats"
                type="number"
                value={newVehicle.seats}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, seats: e.target.value }))
                }
                placeholder="VD: 45"
              />
            </div>

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={newVehicle.status}
                onValueChange={(value) =>
                  setNewVehicle((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="break">Tạm dừng</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Tình trạng</Label>
              <Select
                value={newVehicle.condition}
                onValueChange={(value) =>
                  setNewVehicle((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Tuyệt vời</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="fair">Khá</SelectItem>
                  <SelectItem value="poor">Kém</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddVehicle}>
              <Save className="w-4 h-4 mr-2" />
              Thêm xe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin xe</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin xe buýt trong hệ thống
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editLicensePlate">Biển số xe</Label>
                <Input
                  id="editLicensePlate"
                  value={selectedVehicle.licensePlate}
                  onChange={(e) =>
                    setSelectedVehicle((prev) => ({
                      ...prev,
                      licensePlate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editBrand">Hãng xe</Label>
                <Input
                  id="editBrand"
                  value={selectedVehicle.brand}
                  onChange={(e) =>
                    setSelectedVehicle((prev) => ({
                      ...prev,
                      brand: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editModel">Dòng xe</Label>
                <Input
                  id="editModel"
                  value={selectedVehicle.model}
                  onChange={(e) =>
                    setSelectedVehicle((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editSeats">Số ghế</Label>
                <Input
                  id="editSeats"
                  type="number"
                  value={selectedVehicle.seats}
                  onChange={(e) =>
                    setSelectedVehicle((prev) => ({
                      ...prev,
                      seats: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editStatus">Trạng thái</Label>
                <Select
                  value={selectedVehicle.status}
                  onValueChange={(value) =>
                    setSelectedVehicle((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="break">Tạm dừng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="breakdown">Hỏng hóc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editCondition">Tình trạng</Label>
                <Select
                  value={selectedVehicle.condition}
                  onValueChange={(value) =>
                    setSelectedVehicle((prev) => ({
                      ...prev,
                      condition: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Tuyệt vời</SelectItem>
                    <SelectItem value="good">Tốt</SelectItem>
                    <SelectItem value="fair">Khá</SelectItem>
                    <SelectItem value="poor">Kém</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
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
            <Button onClick={handleUpdateVehicle}>
              <Save className="w-4 h-4 mr-2" />
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết xe buýt</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và trạng thái của xe buýt
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biển số:</span>
                      <span className="font-medium">
                        {selectedVehicle.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hãng xe:</span>
                      <span>{selectedVehicle.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dòng xe:</span>
                      <span>{selectedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số ghế:</span>
                      <span>{selectedVehicle.seats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tốc độ TB:</span>
                      <span>{selectedVehicle.avgSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Thông tin vận hành</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tài xế:</span>
                      <span>
                        {selectedVehicle.assignedDriver || "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tuyến đường:
                      </span>
                      <span>
                        {selectedVehicle.currentRoute || "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tổng chuyến:
                      </span>
                      <span>
                        {selectedVehicle.totalTrips?.toLocaleString()} chuyến
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng km:</span>
                      <span>
                        {selectedVehicle.mileage?.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tình trạng:</span>
                      {getConditionBadge(selectedVehicle.condition)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance & Fuel Status */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Trạng thái Kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Fuel Status */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium flex items-center gap-1">
                        <Gauge className="w-4 h-4" /> Mức nhiên liệu
                      </span>
                      <span className="font-semibold">
                        {selectedVehicle.fuelLevel}%
                      </span>
                    </div>
                    <Progress
                      value={selectedVehicle.fuelLevel}
                      className="h-2"
                      indicatorClassName={getFuelLevelColor(
                        selectedVehicle.fuelLevel
                      )}
                    />
                  </div>

                  {/* Maintenance Status */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-1">
                        <Wrench className="w-4 h-4" /> Bảo trì tiếp theo
                      </span>
                      {isMaintenanceDue(selectedVehicle.nextMaintenance) ? (
                        <Badge variant="destructive">Sắp đến hạn</Badge>
                      ) : (
                        <Badge variant="secondary">Ổn định</Badge>
                      )}
                    </div>
                    <div className="text-sm mt-1">
                      <p>
                        <span className="text-muted-foreground">Cuối:</span>{" "}
                        {new Date(
                          selectedVehicle.lastMaintenance
                        ).toLocaleDateString("vi-VN")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tiếp:</span>{" "}
                        <span
                          className={
                            isMaintenanceDue(selectedVehicle.nextMaintenance)
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {new Date(
                            selectedVehicle.nextMaintenance
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
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
            <Button
              onClick={() => {
                setIsDetailDialogOpen(false);
                handleEditVehicle(selectedVehicle);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
