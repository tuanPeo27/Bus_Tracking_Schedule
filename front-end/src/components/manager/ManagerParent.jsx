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
    User,
} from "lucide-react";
import { createParent, deleteParent, getAllParent, updateParent } from "../../service/adminService";

export default function ManagerParents() {
    const { system, showError } = useNotificationHelpers();
    const [searchTerm, setSearchTerm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [parentsPerPage, setParentsPerPage] = useState(10);
    const [allParent, setAllParent] = useState([]);
    const [newParent, setNewParent] = useState({
        id: "",
        username: "",
        password: "",
    });

    const [editParent, setEditParent] = useState({
        id: "",
        email: "",
        sex: "male",
        phone_number: "",
        address: "",
        username: "",
    })

    const getAllParents = async () => {
        try {
            const res = await getAllParent();
            const dataParent = Array.isArray(res.data) ? res.data : res.data?.DT || [];
            if (res?.data?.EC === 0) {
                const getInfoParent = await Promise.all(
                    dataParent.map(async (item) => {
                        // const scheduleInfo = await getScheduleByParentId(item.id);
                        return { ...item };
                    })
                );
                setAllParent(getInfoParent);
                console.log(getInfoParent);
            } else {
                setAllParent([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phụ huynh:", error);
            setAllParent([]);
        }
    };

    useEffect(() => {
        getAllParents();
        setCurrentPage(1);
    }, [searchTerm])

    const parents = [
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


    const formatLastActive = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 60) return `${minutes} phút trước`;
        return `${hours} giờ trước`;
    };

    const filteredParents = allParent.filter((parent) => {
        const matchesSearch =
            parent.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.phone_number?.includes(searchTerm);

        return matchesSearch;
    });

    const indexOfLastParent = currentPage * parentsPerPage;
    const indexOfFirstParent = indexOfLastParent - parentsPerPage;
    const currentParents = filteredParents.slice(indexOfFirstParent, indexOfLastParent);
    const totalPages = Math.ceil(filteredParents.length / parentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditParent = (editParent) => {
        setSelectedParent(editParent);
        setEditParent({
            id: editParent.id,
            email: editParent.email,
            sex: editParent.sex,
            phone_number: editParent.phone_number,
            address: editParent.address,
            username: editParent.username,
        });
        setIsEditDialogOpen(true);
    };

    const handleAddParent = async () => {
        if (
            !newParent.username ||
            !newParent.password
        ) {
            showError("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        try {
            console.log("Creating parent:", newParent);
            await createParent(newParent);

            system.dataCreated("Phụ huynh mới");
            setIsAddDialogOpen(false);
            setNewParent({
                id: "",
                username: "",
                password: "",
            });
        } catch (error) {
            const errorMessage = error.response?.data?.EM || "Không thể tạo phụ huynh!";
            showError(errorMessage);
        }

        await getAllParents();

    };

    const handleDeleteParent = (parent) => {
        setSelectedParent(parent);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteParent = async () => {
        try {
            await deleteParent(selectedParent.id);
            console.log("Deleting parent:", selectedParent);
            system.dataDeleted(`Học sinh ${selectedParent.username}`);
            setIsDeleteDialogOpen(false);
            setSelectedParent(null);
        } catch (error) {
            console.error("Lỗi khi xóa phụ huynh:", error);
            showError("Không thể xóa phụ huynh. Vui lòng thử lại!");
            setIsDeleteDialogOpen(false);
            setSelectedParent(null);
        }
        await getAllParents();
    };

    // const handleSaveNewParent = () => {
    //   if (!newParent.name || !newParent.licenseNumber || !newParent.phone) {
    //     showError("Vui lòng điền đầy đủ thông tin bắt buộc");
    //     return;
    //   }

    //   // Kiểm tra trùng lặp giấy phép lái xe
    //   const existingParent = parents.find(
    //     (d) => d.licenseNumber === newParent.licenseNumber
    //   );
    //   if (existingParent) {
    //     showError("Số giấy phép lái xe đã tồn tại trong hệ thống");
    //     return;
    //   }

    //   // Kiểm tra trùng lặp số điện thoại
    //   const existingPhone = parents.find((d) => d.phone === newParent.phone);
    //   if (existingPhone) {
    //     showError("Số điện thoại đã được sử dụng bởi phụ huynh khác");
    //     return;
    //   }

    //   // Tạo phụ huynh mới
    //   const parentData = {
    //     ...newParent,
    //     id: `TX${String(parents.length + 1).padStart(3, "0")}`,
    //     status: "offline",
    //     currentVehicle: null,
    //     currentRoute: null,
    //     totalTrips: 0,
    //     onTimeRate: 0,
    //     lastActive: new Date(),
    //   };

    //   // Trong ứng dụng thực, sẽ gọi API để lưu vào database
    //   console.log("Thêm phụ huynh mới:", parentData);

    //   showSuccess(`Đã thêm phụ huynh ${newParent.name} thành công`);
    //   setIsAddDialogOpen(false);
    //   setNewParent({
    //     name: "",
    //     birthDate: "",
    //     gender: "Nam",
    //     licenseNumber: "",
    //     phone: "",
    //   });
    // };

    // const handleDeleteParent = (parentId) => {
    //   const parent = parents.find((d) => d.id === parentId);
    //   if (parent) {
    //     // Kiểm tra nếu phụ huynh đang hoạt động
    //     if (parent.status === "active") {
    //       showError(
    //         "Không thể xóa phụ huynh đang hoạt động. Vui lòng chuyển phụ huynh về trạng thái offline trước"
    //       );
    //       return;
    //     }

    //     // Trong ứng dụng thực, sẽ gọi API để xóa
    //     console.log("Xóa phụ huynh:", parentId);
    //     showInfo(`Đã xóa phụ huynh ${parent.name}`);
    //   }
    // };



    const handleUpdateParent = async () => {
        try {
            await updateParent(editParent, editParent.id);
            console.log("Updating phụ huynh:", editParent);
            system.dataUpdated(`Phụ huynh ${editParent.id}`);
            setIsEditDialogOpen(false);
            setSelectedParent(null);
        } catch (error) {
            console.error("Lỗi khi chỉnh sửa phụ huynh:", error);
            showError("Không thể chỉnh sửa phụ huynh. Vui lòng thử lại!");
        }
        await getAllParents();
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-1 gap-1">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng phụ huynh</p>
                                <p className="font-semibold">{allParent?.length}</p>
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
                            <User className="w-5 h-5" />
                            Quản lý Phụ huynh
                        </CardTitle>

                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm phụ huynh
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

            {/* Parents Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã phụ huynh</TableHead>
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
                                currentParents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <UserCheck className="w-8 h-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    Không tìm thấy phụ huynh nào
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (currentParents).map((parent) => (
                                    <TableRow key={parent.id}>

                                        <TableCell>
                                            <Badge variant="outline">{parent.id}</Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{parent?.username}</p>

                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{parent?.sex}</p>

                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{parent?.address}</p>

                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{parent?.phone_number}</p>

                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{parent?.email}</p>

                                            </div>
                                        </TableCell>


                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditParent(parent)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDeleteParent(parent)}
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



            {/* Edit Parent Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Cập nhật thông tin phụ huynh</DialogTitle>
                        <DialogDescription>
                            Nhập đầy đủ thông tin để cập nhật thông tin phụ huynh
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
                                    value={editParent.username || ""}
                                    onChange={(e) =>
                                        setEditParent({ ...editParent, username: e.target.value })
                                    }
                                />
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="new-phone">
                                    Số điện thoại
                                </Label>
                                <Input
                                    placeholder="0912345678"
                                    value={editParent.phone_number || ""}
                                    onChange={(e) =>
                                        setEditParent({ ...editParent, phone_number: e.target.value })
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
                                    value={editParent.address || ""}
                                    onChange={(e) =>
                                        setEditParent({ ...editParent, address: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-gender">Giới tính</Label>
                                <Select
                                    value={editParent.sex || ""}
                                    onValueChange={(value) =>
                                        setEditParent({ ...editParent, sex: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                value={editParent.email || ""}
                                onChange={(e) =>
                                    setEditParent({ ...editParent, email: e.target.value })
                                }
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdateParent}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Cập nhật
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Parent delete Dialog */}
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
                                Bạn có chắc chắn muốn xóa phụ huynh{" "}:
                                <strong>{selectedParent?.username}</strong>
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
                        <Button variant="destructive" onClick={confirmDeleteParent}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Parent Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thêm phụ huynh mới</DialogTitle>
                        <DialogDescription>
                            Nhập đầy đủ thông tin để thêm phụ huynh mới vào hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">
                                Tên
                            </Label>
                            <Input
                                placeholder="Nguyễn Văn A"
                                value={newParent.username}
                                onChange={(e) =>
                                    setNewParent({ ...newParent, username: e.target.value })
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
                                    value={newParent.password}
                                    onChange={(e) =>
                                        setNewParent({ ...newParent, password: e.target.value })
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
                            onClick={handleAddParent}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm phụ huynh
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
