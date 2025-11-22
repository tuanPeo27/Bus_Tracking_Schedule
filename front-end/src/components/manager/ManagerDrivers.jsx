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
  EyeOff,
} from "lucide-react";
import { createDriver, deleteDriver, getAllDriver, getScheduleByDriverId, updateDriver } from "../../service/adminService";

export default function ManagerDrivers() {
  const { system, showError } = useNotificationHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage, setDriversPerPage] = useState(10);
  const [allDriver, setAllDriver] = useState([]);
  const [newDriver, setNewDriver] = useState({
    id: "",
    username: "",
    password: "",
  });

  const [editDriver, setEditDriver] = useState({
    id: "",
    email: "",
    sex: "male",
    phone_number: "",
    address: "",
    username: "",
  })

  const getAllDrivers = async () => {
    try {
      const res = await getAllDriver();
      const dataDriver = Array.isArray(res.data) ? res.data : res.data?.DT || [];
      if (res?.data?.EC === 0) {
        const getInfoDriver = await Promise.all(
          dataDriver.map(async (item) => {
            // const scheduleInfo = await getScheduleByDriverId(item.id);
            return { ...item };
          })
        );
        setAllDriver(getInfoDriver);
        console.log(getInfoDriver);
      } else {
        setAllDriver([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài xế:", error);
      setAllDriver([]);
    }
  };

  useEffect(() => {
    getAllDrivers();
    setCurrentPage(1);
  }, [searchTerm])



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


  const filteredDrivers = allDriver.filter((driver) => {
    const matchesSearch =
      driver.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone_number?.includes(searchTerm);

    return matchesSearch;
  });

  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditDriver = (editDriver) => {
    setSelectedDriver(editDriver);
    setEditDriver({
      id: editDriver.id,
      email: editDriver.email,
      sex: editDriver.sex,
      phone_number: editDriver.phone_number,
      address: editDriver.address,
      username: editDriver.username,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddDriver = async () => {
    if (
      !newDriver.username ||
      !newDriver.password
    ) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      console.log("Creating driver:", newDriver);
      await createDriver(newDriver);

      system.dataCreated("Tài xế mới");
      setIsAddDialogOpen(false);
      setNewDriver({
        id: "",
        username: "",
        password: "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.EM || "Không thể tạo tài xế!";
      showError(errorMessage);
    }

    await getAllDrivers();

  };

  const handleDeleteDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDriver = async () => {
    if (!selectedDriver || !selectedDriver.id) {
      showError("Lỗi", "Không có tài xế để xóa.");
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
      return;
    }

    try {
      // kiểm tra xem có lịch trình tham chiếu tới tài xế này không
      const schedRes = await getScheduleByDriverId(selectedDriver.id);
      const schedules = Array.isArray(schedRes?.data) ? schedRes.data : (schedRes?.data?.DT || []);
      if (schedules && schedules.length > 0) {
        showError("Không thể xóa", `Tài xế đang có ${schedules.length} lịch trình liên quan. Vui lòng xóa hoặc chuyển các lịch trình đó trước khi xóa tài xế.`);
        setIsDeleteDialogOpen(false);
        setSelectedDriver(null);
        return;
      }

      await deleteDriver(selectedDriver.id);
      console.log("Deleting driver:", selectedDriver);
      system.dataDeleted(`Tài xế ${selectedDriver.username}`);
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error("Lỗi khi xóa tài xế:", error);
      showError("Không thể xóa tài xế. Vui lòng thử lại!");
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
    }
    await getAllDrivers();
  };

  const handleUpdateDriver = async () => {
    try {
      await updateDriver(editDriver, editDriver.id);
      console.log("Updating tài xế:", editDriver);
      system.dataUpdated(`Tài xế ${editDriver.id}`);
      setIsEditDialogOpen(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa tài xế:", error);
      showError("Không thể chỉnh sửa tài xế. Vui lòng thử lại!");
    }
    await getAllDrivers();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-1 gap-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tài xế</p>
                <p className="font-semibold">{allDriver?.length}</p>
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
              onClick={() => setIsAddDialogOpen(true)}
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
              placeholder="Tìm kiếm theo tên, số điện thoại..."
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
                <TableHead>Mã tài xế</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                currentDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Không tìm thấy tài xế nào
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (currentDrivers).map((driver) => (
                  <TableRow key={driver.id}>

                    <TableCell>
                      <Badge variant="outline">{driver.id}</Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{driver?.username}</p>

                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{driver?.sex}</p>

                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{driver?.address}</p>

                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{driver?.phone_number}</p>

                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{driver?.email}</p>

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
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteDriver(driver)}
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



      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin tài xế</DialogTitle>
            <DialogDescription>
              Nhập đầy đủ thông tin để cập nhật thông tin tài xế
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">
                  Tên
                </Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={editDriver.username || ""}
                  onChange={(e) =>
                    setEditDriver({ ...editDriver, username: e.target.value })
                  }
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="new-phone">
                  Số điện thoại
                </Label>
                <Input
                  placeholder="0912345678"
                  value={editDriver.phone_number || ""}
                  onChange={(e) =>
                    setEditDriver({ ...editDriver, phone_number: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-phone">
                  Địa chỉ
                </Label>
                <Input
                  placeholder="101 Nguyễn Trãi"
                  value={editDriver.address || ""}
                  onChange={(e) =>
                    setEditDriver({ ...editDriver, address: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-gender">Giới tính</Label>
                <Select
                  value={editDriver.sex || ""}
                  onValueChange={(value) =>
                    setEditDriver({ ...editDriver, sex: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Khác</SelectItem>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-license">
                Email
              </Label>
              <Input

                placeholder="abc@gmail.com"
                value={editDriver.email || ""}
                onChange={(e) =>
                  setEditDriver({ ...editDriver, email: e.target.value })
                }
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateDriver}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa vĩnh viễn học sinh đã chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Bạn có chắc chắn muốn xóa tài xế{" "}:
                <strong>{selectedDriver?.username}</strong>
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
            <Button variant="destructive" onClick={confirmDeleteDriver}>
              Xóa
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
            <div className="space-y-2">
              <Label htmlFor="new-name">
                Tên
              </Label>
              <Input
                placeholder="Nguyễn Văn A"
                value={newDriver.username}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">
                Mật khẩu
              </Label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={newDriver.password}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, password: e.target.value })
                  }
                  className="pr-10 w-full"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddDriver}
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
