import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import Cookies from "js-cookie";
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
import { getAllBus, createBus, updateBus, deleteBus } from "../../service/adminService";

export default function ManagerVehicles() {
  const { system, showError } = useNotificationHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [allBus, setAllBus] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busesPerPage, setBusesPerPage] = useState(10);

  const [newBus, setNewBus] = useState({
    license_plate: "",
    brand: "",
    model: "",
    seats: "",
    status: "available",
  });

  const [editBus, setEditBus] = useState({
    license_plate: "",
    brand: "",
    model: "",
    seats: "",
    status: "available",
  });


  const getAllBuses = async () => {
    try {
      const res = await getAllBus();
      const dataBus = Array.isArray(res.data) ? res.data : res.data?.DT || [];
      if (res?.data?.EC === 0) {
        const getInfoBus = await Promise.all(
          dataBus.map(async (item) => {
            // const scheduleInfo = await getScheduleByDriverId(item.id);
            return { ...item };
          })
        );
        setAllBus(getInfoBus);
        console.log("check bus", dataBus);
      } else {
        setAllBus([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xe:", error);
      setAllBus([]);
    }
  };

  useEffect(() => {
    getAllBuses();
    setCurrentPage(1);
  }, [searchTerm, filterStatus])

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



  const getStatusBadge = (status) => {
    switch (status) {
      case "in_use":
        return (
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        );
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Có thể sử dụng</Badge>;
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

  const filteredBuses = allBus.filter(
    (bus) => {
      const matchesSearch = (bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bus.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bus.model.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        filterStatus === "all" || bus.status === filterStatus;
      return matchesSearch && matchesStatus
    });

  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = filteredBuses.slice(indexOfFirstBus, indexOfLastBus);
  const totalPages = Math.ceil(filteredBuses.length / busesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // const stats = {
  //   total: vehicles.length,
  //   active: vehicles.filter((v) => v.status === "active").length,
  //   maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  //   breakdown: vehicles.filter((v) => v.status === "breakdown").length,
  // };

  const handleEditVehicle = (vehicle) => {
    setSelectedBus(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedBus(vehicle);
    setIsDetailDialogOpen(true);
  };

  // CRUD Functions
  const handleAddBus = async () => {
    if (
      !newBus.brand ||
      !newBus.license_plate ||
      !newBus.model ||
      !newBus.seats ||
      !newBus.status
    ) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      console.log("Creating bus:", newBus);
      await createBus(newBus);

      system.dataCreated("Xe bus mới");
      setIsAddDialogOpen(false);
      setNewBus({
        license_plate: "",
        brand: "",
        model: "",
        seats: "",
        status: "available",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.EM;
      showError(errorMessage);
      console.log("lỗi", error)
    }

    await getAllBuses();

  };
  const handleUpdateBus = async () => {
    try {
      console.log("editbus", selectedBus)
      await updateBus(selectedBus, selectedBus.id);
      console.log("Updating xe bus:", selectedBus);
      system.dataUpdated(`Xe bus ${selectedBus.id}`);
      setIsEditDialogOpen(false);
      setSelectedBus(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa xe bus:", error);
      showError("Không thể chỉnh sửa xe bus. Vui lòng thử lại!");
    }
    await getAllBuses();
  };

  const handleDeleteBus = (Bus) => {
    setSelectedBus(Bus);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBus = async () => {
    try {
      await deleteBus(selectedBus.id);
      console.log("Deleting bus:", selectedBus);
      system.dataDeleted(`Xe bus ${selectedBus.id}`);
      setIsDeleteDialogOpen(false);
      setSelectedBus(null);
    } catch (error) {
      console.error("Lỗi khi xóa xe bus:", error);
      showError("Không thể xóa xe bus. Vui lòng thử lại!");
      setIsDeleteDialogOpen(false);
      setSelectedBus(null);
    }
    await getAllBuses();
  };


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-1 gap-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng xe buýt</p>
                <p className="font-semibold">{allBus?.length}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo biển số, hãng xe, tài xế..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="available">Có thể sử dụng</SelectItem>
                  <SelectItem value="in_use">Đang hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã xe</TableHead>
                <TableHead>Tên xe</TableHead>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Số chỗ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                currentBuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Bus className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Không tìm thấy xe bus nào
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (

                  currentBuses).map((bus) => (
                    <TableRow
                      key={bus.id}
                      className={`cursor-pointer transition-colors ${selectedBusId === bus.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                        }`}
                    >

                      <TableCell>
                        <Badge variant="outline">{bus?.id}</Badge>
                      </TableCell>

                      <TableCell>
                        <p className="font-medium">
                          {bus?.brand} - {bus?.model}
                        </p>
                      </TableCell>


                      <TableCell>
                        <p className="font-medium">
                          {bus?.license_plate}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="font-medium">
                          {bus?.seats}
                        </p>
                      </TableCell>

                      <TableCell>{getStatusBadge(bus?.status)}</TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVehicle(bus);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBus(bus)}
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

        {/* Phân trang */}
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

      {/* Maintenance Alerts */}


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
                id="license_plate"
                value={newBus.license_plate}
                onChange={(e) =>
                  setNewBus((newBus) => ({
                    ...newBus,
                    license_plate: e.target.value,
                  }))
                }
                placeholder="VD: 29A12345"
              />
            </div>

            <div>
              <Label htmlFor="brand">Hãng xe</Label>
              <Input
                id="brand"
                value={newBus.brand}
                onChange={(e) =>
                  setNewBus((newBus) => ({ ...newBus, brand: e.target.value }))
                }
                placeholder="VD: Hyundai"
              />
            </div>

            <div>
              <Label htmlFor="model">Dòng xe</Label>
              <Input
                id="model"
                value={newBus.model}
                onChange={(e) =>
                  setNewBus((newBus) => ({ ...newBus, model: e.target.value }))
                }
                placeholder="VD: Universe"
              />
            </div>

            <div>
              <Label htmlFor="seats">Số ghế</Label>
              <Input
                id="seats"
                type="number"
                value={newBus.seats}
                onChange={(e) =>
                  setNewBus((newBus) => ({ ...newBus, seats: e.target.value }))
                }
                placeholder="VD: 45"
              />
            </div>

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={newBus.status}
                onValueChange={(value) =>
                  setNewBus((newBus) => ({ ...newBus, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Có thể sử dụng</SelectItem>
                  <SelectItem value="in_use">Đang hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddBus}>
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

          {selectedBus && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editLicensePlate">Biển số xe</Label>
                <Input
                  id="editLicense_plate"
                  value={selectedBus.license_plate}
                  onChange={(e) =>
                    setSelectedBus((editBus) => ({
                      ...editBus,
                      license_plate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editBrand">Hãng xe</Label>
                <Input
                  id="editBrand"
                  value={selectedBus.brand}
                  onChange={(e) =>
                    setSelectedBus((editBus) => ({
                      ...editBus,
                      brand: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editModel">Dòng xe</Label>
                <Input
                  id="editModel"
                  value={selectedBus.model}
                  onChange={(e) =>
                    setSelectedBus((editBus) => ({
                      ...editBus,
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
                  value={selectedBus.seats}
                  onChange={(e) =>
                    setSelectedBus((editBus) => ({
                      ...editBus,
                      seats: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="editStatus">Trạng thái</Label>
                <Select
                  value={selectedBus.status}
                  onValueChange={(value) =>
                    setSelectedBus((editBus) => ({ ...editBus, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Có thể sử dụng</SelectItem>
                    <SelectItem value="in_use">Đang hoạt động</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
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
            <Button onClick={handleUpdateBus}>
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

          {selectedBus && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biển số:</span>
                      <span className="font-medium">
                        {selectedBus.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hãng xe:</span>
                      <span>{selectedBus.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dòng xe:</span>
                      <span>{selectedBus.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số ghế:</span>
                      <span>{selectedBus.seats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tốc độ TB:</span>
                      <span>{selectedBus.avgSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Thông tin vận hành</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tài xế:</span>
                      <span>
                        {selectedBus.assignedDriver || "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tuyến đường:
                      </span>
                      <span>
                        {selectedBus.currentRoute || "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tổng chuyến:
                      </span>
                      <span>
                        {selectedBus.totalTrips?.toLocaleString()} chuyến
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng km:</span>
                      <span>
                        {selectedBus.mileage?.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tình trạng:</span>
                      {getConditionBadge(selectedBus.condition)}
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
                        {selectedBus.fuelLevel}%
                      </span>
                    </div>
                    <Progress
                      value={selectedBus.fuelLevel}
                      className="h-2"
                      indicatorClassName={getFuelLevelColor(
                        selectedBus.fuelLevel
                      )}
                    />
                  </div>

                  {/* Maintenance Status */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-1">
                        <Wrench className="w-4 h-4" /> Bảo trì tiếp theo
                      </span>
                      {isMaintenanceDue(selectedBus.nextMaintenance) ? (
                        <Badge variant="destructive">Sắp đến hạn</Badge>
                      ) : (
                        <Badge variant="secondary">Ổn định</Badge>
                      )}
                    </div>
                    <div className="text-sm mt-1">
                      <p>
                        <span className="text-muted-foreground">Cuối:</span>{" "}
                        {new Date(
                          selectedBus.lastMaintenance
                        ).toLocaleDateString("vi-VN")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tiếp:</span>{" "}
                        <span
                          className={
                            isMaintenanceDue(selectedBus.nextMaintenance)
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {new Date(
                            selectedBus.nextMaintenance
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
                handleEditVehicle(selectedBus);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa xe bus</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa vĩnh viễn xe bus đã chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Bạn có chắc chắn muốn xóa xe bus{" "}:
                <strong>{selectedBus?.id}</strong>
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
            <Button variant="destructive" onClick={confirmDeleteBus}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
