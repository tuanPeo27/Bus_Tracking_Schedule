import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useIsMobile } from "../ui/use-mobile";
import { toast } from "sonner@2.0.3";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Upload,
  Download,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

export default function ManagerStudents() {
  const isMobile = useIsMobile();
  const [students, setStudents] = useState([
    {
      id: "HS001",
      name: "Nguyễn Văn An",
      grade: "10",
      class: "10A1",
      parentName: "Nguyễn Văn Bình",
      parentPhone: "0987654321",
      parentEmail: "binhnv@email.com",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      busRoute: "Tuyến 01",
      busStop: "Trạm số 3",
      status: "active",
      joinDate: "2024-09-01",
      notes: "Học sinh ngoan, đi học đều đặn",
      emergencyContact: "0912345678",
      medicalNotes: "Không có vấn đề sức khỏe đặc biệt",
    },
    {
      id: "HS002",
      name: "Trần Thị Bình",
      grade: "11",
      class: "11B2",
      parentName: "Trần Văn Cường",
      parentPhone: "0976543210",
      parentEmail: "cuongtv@email.com",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      busRoute: "Tuyến 02",
      busStop: "Trạm số 5",
      status: "active",
      joinDate: "2023-09-01",
      emergencyContact: "0923456789",
    },
    {
      id: "HS003",
      name: "Lê Minh Châu",
      grade: "12",
      class: "12C1",
      parentName: "Lê Văn Dũng",
      parentPhone: "0965432109",
      parentEmail: "dunglv@email.com",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      busRoute: "Tuyến 01",
      busStop: "Trạm số 7",
      status: "active",
      joinDate: "2022-09-01",
    },
    {
      id: "HS004",
      name: "Phạm Thị Dung",
      grade: "9",
      class: "9A3",
      parentName: "Phạm Văn Em",
      parentPhone: "0954321098",
      parentEmail: "empv@email.com",
      address: "321 Đường GHI, Quận 4, TP.HCM",
      busRoute: "Tuyến 03",
      busStop: "Trạm số 2",
      status: "inactive",
      joinDate: "2024-09-01",
      notes: "Tạm nghỉ học do gia đình chuyển nhà",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoute, setFilterRoute] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = filterGrade === "all" || student.grade === filterGrade;
    const matchesStatus =
      filterStatus === "all" || student.status === filterStatus;
    const matchesRoute =
      filterRoute === "all" || student.busRoute === filterRoute;

    return matchesSearch && matchesGrade && matchesStatus && matchesRoute;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const inactiveStudents = students.filter(
    (s) => s.status === "inactive"
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Tạm nghỉ</Badge>;
      case "graduated":
        return (
          <Badge className="bg-blue-100 text-blue-800">Đã tốt nghiệp</Badge>
        );
      case "transferred":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Chuyển trường</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddStudent = () => {
    setFormData({
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    setIsAddDialogOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (studentId) => {
    setStudents(students.filter((s) => s.id !== studentId));
    toast.success("Đã xóa học sinh thành công");
  };

  const handleSaveStudent = (isEdit = false) => {
    if (
      !formData.name ||
      !formData.grade ||
      !formData.class ||
      !formData.parentName
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (isEdit && selectedStudent) {
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? { ...formData } : s))
      );
      toast.success("Đã cập nhật thông tin học sinh");
      setIsEditDialogOpen(false);
    } else {
      const newStudent = {
        ...formData,
        id: `HS${String(students.length + 1).padStart(3, "0")}`,
      };
      setStudents([...students, newStudent]);
      toast.success("Đã thêm học sinh mới");
      setIsAddDialogOpen(false);
    }

    setFormData({});
    setSelectedStudent(null);
  };

  const StudentForm = ({ isEdit = false }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập họ và tên học sinh"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Khối *</Label>
          <Select
            value={formData.grade || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, grade: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn khối" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Khối 6</SelectItem>
              <SelectItem value="7">Khối 7</SelectItem>
              <SelectItem value="8">Khối 8</SelectItem>
              <SelectItem value="9">Khối 9</SelectItem>
              <SelectItem value="10">Khối 10</SelectItem>
              <SelectItem value="11">Khối 11</SelectItem>
              <SelectItem value="12">Khối 12</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Lớp *</Label>
          <Input
            id="class"
            value={formData.class || ""}
            onChange={(e) =>
              setFormData({ ...formData, class: e.target.value })
            }
            placeholder="Ví dụ: 10A1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select
            value={formData.status || "active"}
            onValueChange={(value) => setFormData({ ...formData, status })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang học</SelectItem>
              <SelectItem value="inactive">Tạm nghỉ</SelectItem>
              <SelectItem value="graduated">Đã tốt nghiệp</SelectItem>
              <SelectItem value="transferred">Chuyển trường</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentName">Tên phụ huynh *</Label>
        <Input
          id="parentName"
          value={formData.parentName || ""}
          onChange={(e) =>
            setFormData({ ...formData, parentName: e.target.value })
          }
          placeholder="Nhập tên phụ huynh"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="parentPhone">Số điện thoại phụ huynh</Label>
          <Input
            id="parentPhone"
            value={formData.parentPhone || ""}
            onChange={(e) =>
              setFormData({ ...formData, parentPhone: e.target.value })
            }
            placeholder="0987654321"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentEmail">Email phụ huynh</Label>
          <Input
            id="parentEmail"
            type="email"
            value={formData.parentEmail || ""}
            onChange={(e) =>
              setFormData({ ...formData, parentEmail: e.target.value })
            }
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea
          id="address"
          value={formData.address || ""}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Nhập địa chỉ đầy đủ"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="busRoute">Tuyến xe buýt</Label>
          <Select
            value={formData.busRoute || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, busRoute: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tuyến" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tuyến 01">Tuyến 01</SelectItem>
              <SelectItem value="Tuyến 02">Tuyến 02</SelectItem>
              <SelectItem value="Tuyến 03">Tuyến 03</SelectItem>
              <SelectItem value="Tuyến 04">Tuyến 04</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="busStop">Trạm dừng</Label>
          <Input
            id="busStop"
            value={formData.busStop || ""}
            onChange={(e) =>
              setFormData({ ...formData, busStop: e.target.value })
            }
            placeholder="Ví dụ: Trạm số 3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="joinDate">Ngày nhập học</Label>
          <Input
            id="joinDate"
            type="date"
            value={formData.joinDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, joinDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Liên hệ khẩn cấp</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact || ""}
            onChange={(e) =>
              setFormData({ ...formData, emergencyContact: e.target.value })
            }
            placeholder="Số điện thoại khẩn cấp"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalNotes">Ghi chú y tế</Label>
        <Textarea
          id="medicalNotes"
          value={formData.medicalNotes || ""}
          onChange={(e) =>
            setFormData({ ...formData, medicalNotes: e.target.value })
          }
          placeholder="Ghi chú về tình trạng sức khỏe, dị ứng..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú khác</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Các ghi chú khác về học sinh"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                <p className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
                  {totalStudents}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang học</p>
                <p
                  className={`${isMobile ? "text-xl" : "text-2xl"
                    } font-bold text-green-600`}
                >
                  {activeStudents}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tạm nghỉ</p>
                <p
                  className={`${isMobile ? "text-xl" : "text-2xl"
                    } font-bold text-gray-600`}
                >
                  {inactiveStudents}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ đi học</p>
                <p
                  className={`${isMobile ? "text-xl" : "text-2xl"
                    } font-bold text-blue-600`}
                >
                  {totalStudents > 0
                    ? Math.round((activeStudents / totalStudents) * 100)
                    : 0}
                  %
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thanh công cụ */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quản lý học sinh
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddStudent} className="gap-2">
                <UserPlus className="w-4 h-4" />
                {isMobile ? "Thêm" : "Thêm học sinh"}
              </Button>


            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bộ lọc và tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo khối" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khối</SelectItem>
                <SelectItem value="6">Khối 6</SelectItem>
                <SelectItem value="7">Khối 7</SelectItem>
                <SelectItem value="8">Khối 8</SelectItem>
                <SelectItem value="9">Khối 9</SelectItem>
                <SelectItem value="10">Khối 10</SelectItem>
                <SelectItem value="11">Khối 11</SelectItem>
                <SelectItem value="12">Khối 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang học</SelectItem>
                <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                <SelectItem value="graduated">Đã tốt nghiệp</SelectItem>
                <SelectItem value="transferred">Chuyển trường</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRoute} onValueChange={setFilterRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo tuyến" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tuyến</SelectItem>
                <SelectItem value="Tuyến 01">Tuyến 01</SelectItem>
                <SelectItem value="Tuyến 02">Tuyến 02</SelectItem>
                <SelectItem value="Tuyến 03">Tuyến 03</SelectItem>
                <SelectItem value="Tuyến 04">Tuyến 04</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bảng danh sách học sinh */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Phụ huynh</TableHead>
                    <TableHead>Tuyến xe</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Không tìm thấy học sinh nào
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.parentPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.grade}
                          {student.class}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{student.parentName}</p>
                            {student.parentEmail && (
                              <p className="text-sm text-muted-foreground">
                                {student.parentEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{student.busRoute}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.busStop}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa học sinh "
                                    {student.name}"? Hành động này không thể
                                    hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteStudent(student.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm học sinh */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <DialogHeader>
            <DialogTitle>Thêm học sinh mới</DialogTitle>
            <DialogDescription>
              Điền thông tin đầy đủ cho học sinh mới. Các trường có dấu (*) là
              bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <StudentForm />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleSaveStudent(false)}>
              Thêm học sinh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog sửa học sinh */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <DialogHeader>
            <DialogTitle>Sửa thông tin học sinh</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho học sinh {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>

          <StudentForm isEdit={true} />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={() => handleSaveStudent(true)}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
