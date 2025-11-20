import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Cookies from "js-cookie";
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
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
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
  Plus,
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
import { createStudent, deleteStudent, getAllStudent, getInfoRoute, updateStudent, getAllParent, getAllRoute } from "../../service/adminService";
import { getInfoParent } from "../../service/parentService";
import { useNotificationHelpers } from "../useNotificationHelpers";

export default function ManagerStudents() {
  const { system, showError } = useNotificationHelpers();
  const isMobile = useIsMobile();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParent, setFilterParent] = useState("all");
  const [filterRoute, setFilterRoute] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listRoute, setListRoute] = useState([]);
  const [listParent, setListParent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [newStudent, setNewStudent] = useState({
    id: "",
    age: "",
    school: "",
    name: "",
    pickup_point: "",
    dropoff_point: "",
    parent_id: "",
    route_id: "",
  });

  const [editStudent, setEditStudent] = useState({
    id: "",
    age: "",
    school: "",
    name: "",
    pickup_point: "",
    dropoff_point: "",
  })

  const [allStudent, setAllStudent] = useState([]);

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

  const fetchParents = async () => {
    try {
      const res = await getAllParent();
      const data = res?.data;
      if (data && data.EC === 0 && Array.isArray(data.DT)) {
        setListParent(data.DT);
      } else {
        console.error("Lỗi khi lấy dữ liệu phụ huynh:", errorMessage);
      }
    } catch (error) {
      console.error("Lỗi mạng khi lấy phụ huynh:", error.message);
    }
  };

  const getAllStudents = async () => {
    try {
      const res = await getAllStudent();
      const dataStudent = Array.isArray(res.data) ? res.data : res.data?.DT || [];
      if (res?.data?.EC === 0) {
        const infoStudent = await Promise.all(
          dataStudent.map(async (item) => {
            const routeInfo = await getInfoRoute(item.route_id);
            const parentInfo = await getInfoParent(item.parent_id);
            return { ...item, routeInfo, parentInfo };
          })
        );
        setAllStudent(infoStudent);

      } else {
        setAllStudent([]);
      }
      console.log("Check student", allStudent);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
      setAllStudent([]);

    }
  };

  useEffect(() => {
    getAllStudents();
    fetchParents();
    fetchRoutes();
    setCurrentPage(1);
  }, [searchTerm, filterParent, filterRoute]);

  const filteredStudents = allStudent.filter((student) => {
    const matchesSearch =
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (student.routeInfo?.data?.DT?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (student.routeInfo?.data?.DT?.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (student.routeInfo?.data?.DT?.end_point.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (student.parentInfo?.data?.DT?.username.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesParent =
      filterParent === "all" || student.parent_id === filterParent;
    const matchesRoute =
      filterRoute === "all" || student.route_id === filterRoute;

    return matchesSearch && matchesRoute && matchesParent
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddStudent = async () => {

    if (
      !newStudent.name ||
      !newStudent.school ||
      !newStudent.age ||
      !newStudent.parent_id ||
      !newStudent.route_id
    ) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newStudent.age < 6 || newStudent.age > 99) {
      showError("Vui lòng nhập đúng tuổi");
      return;
    }
    if (/\d/.test(newStudent.name)) {
      showError("Vui lòng nhập họ và tên không có số");
      return;
    }

    try {
      console.log("Creating schedule:", newStudent);
      const res = await createStudent(newStudent);
      console.log("Check res", res);
      system.dataCreated("Học sinh mới");
      setIsAddDialogOpen(false);
      setNewStudent({
        id: "",
        age: "",
        route_id: "",
        parent_id: "",
        dropoff_point: "",
        pickup_point: "",
        school: "",
        name: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo học sinh:", error);
      showError("Không thể tạo học sinh. Vui lòng thử lại!");
    }

    await getAllStudents();

  };

  const handleEditStudent = (editStudent) => {
    setSelectedStudent(editStudent);
    setEditStudent({
      id: editStudent.id,
      age: editStudent.age,
      school: editStudent.school,
      name: editStudent.name,
      pickup_point: editStudent.pickup_point,
      dropoff_point: editStudent.dropoff_point,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    try {
      const res = await updateStudent(editStudent, editStudent.id);
      console.log("check res", res);
      console.log("Updating student:", editStudent);
      system.dataUpdated(`Học sinh ${editStudent.id}`);
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa học sinh:", error);
      showError("Không thể chỉnh sửa học sinh. Vui lòng thử lại!");
    }
    await getAllStudents();
  };

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    try {
      await deleteStudent(selectedStudent.id);
      console.log("Deleting schedule:", selectedStudent);
      system.dataDeleted(`Học sinh ${selectedStudent.name}`);
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      showError("Không thể xóa học sinh. Vui lòng thử lại!");
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
    await getAllStudents();
  };


  // const handleSaveStudent = (isEdit = false) => {
  //   if (
  //     !newStudent.name ||
  //     !newStudent.grade ||
  //     !newStudent.class ||
  //     !newStudent.parentName
  //   ) {
  //     toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
  //     return;
  //   }

  //   if (isEdit && selectedStudent) {
  //     setStudents(
  //       students.map((s) => (s.id === selectedStudent.id ? { ...newStudent } : s))
  //     );
  //     toast.success("Đã cập nhật thông tin học sinh");
  //     setIsEditDialogOpen(false);
  //   } else {
  //     const newStudent = {
  //       ...newStudent,
  //       id: `HS${String(students.length + 1).padStart(3, "0")}`,
  //     };
  //     setStudents([...students, newStudent]);
  //     toast.success("Đã thêm học sinh mới");
  //     setIsAddDialogOpen(false);
  //   }

  //   setNewStudent({});
  //   setSelectedStudent(null);
  // };

  // const StudentForm = ({ isEdit = false }) => (

  //   <div className="space-y-4">
  //     <div className="space-y-2">
  //       <Label htmlFor="name">Họ và tên</Label>
  //       <Input
  //         id="name"
  //         value={newStudent.name}
  //         onChange={(e) =>
  //           setNewStudent({ ...newStudent, name: e.target.value })
  //         }
  //         placeholder="Họ và tên"
  //       />
  //     </div>
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //       <div className="space-y-2">
  //         <Label htmlFor="parentName">Trường</Label>
  //         <Input
  //           id="school"
  //           value={newStudent.school}
  //           onChange={(e) =>
  //             setNewStudent({ ...newStudent, school: e.target.value })
  //           }
  //           placeholder="Nhập tên trường"
  //         />
  //       </div>
  //       <div className="space-y-2">
  //         <Label htmlFor="class">Tuổi</Label>
  //         <Input
  //           id="age"
  //           value={newStudent.age}
  //           onChange={(e) =>
  //             setNewStudent({ ...newStudent, age: e.target.value })
  //           }
  //           placeholder="Nhập tuổi"
  //         />
  //       </div>
  //     </div>



  //     <div className="space-y-2">
  //       <Label htmlFor="status">Phụ huynh</Label>
  //       <Select
  //         value={newStudent.parent_id}
  //         onValueChange={(value) => setNewStudent({ ...newStudent, parent_id: value })}
  //       >
  //         <SelectTrigger>
  //           <SelectValue />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {listParent.map((parent) => (
  //             <SelectItem key={parent.id} value={parent.id}>
  //               {parent.username}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>

  //     </div>
  //     <div className="space-y-2">
  //       <Label htmlFor="route">Tuyến</Label>
  //       <Select
  //         value={newStudent.route_id}
  //         onValueChange={(value) => setNewStudent({ ...newStudent, route_id: value })}
  //       >
  //         <SelectTrigger>
  //           <SelectValue />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {listRoute.map((route) => (
  //             <SelectItem key={route.id} value={route.id}>
  //               {route.name}: {route.start_point} - {route.end_point}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     </div>



  //   </div>
  // );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 gap-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                <p className="font-semibold">{allStudent?.length}</p>
              </div>
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    {isMobile ? "Thêm" : "Thêm học sinh"}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Thêm học sinh mới</DialogTitle>
                    <DialogDescription>
                      Thêm học sinh vào hệ thống.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Họ và tên</Label>
                        <Input
                          type="text"
                          value={newStudent.name}
                          onChange={(e) =>
                            setNewStudent({ ...newStudent, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Tuổi</Label>
                        <Input
                          type="number"
                          value={newStudent.age}
                          onChange={(e) =>
                            setNewStudent({ ...newStudent, age: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Trường</Label>
                        <Input
                          value={newStudent.school}
                          onChange={(e) =>
                            setNewStudent({ ...newStudent, school: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Phụ huynh</Label>
                        <Select
                          value={newStudent.parent_id}
                          onValueChange={(value) =>
                            setNewStudent({ ...newStudent, parent_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phụ huynh" />
                          </SelectTrigger>
                          <SelectContent>
                            {listParent.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Tuyến</Label>
                      <Select
                        value={newStudent.route_id}
                        onValueChange={(value) => {
                          const selectedRoute = listRoute.find((r) => r.id === value);
                          setNewStudent({
                            ...newStudent, route_id: value,
                            pickup_point: selectedRoute?.start_point || "",
                            dropoff_point: selectedRoute?.end_point || "",
                          })
                        }
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tuyến" />
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

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddStudent} className="flex-1">
                        Thêm học sinh
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>




            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bộ lọc và tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>



            <Select value={filterParent} onValueChange={setFilterParent}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo phụ huynh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phụ huynh</SelectItem>
                {listParent.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

          {/* Bảng danh sách học sinh */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Tuổi</TableHead>
                    <TableHead>Trường</TableHead>
                    <TableHead>Phụ huynh</TableHead>
                    <TableHead>Tuyến xe</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.length === 0 ? (
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
                    (currentStudents.length > 0 ? currentStudents : allStudent).map((student) => (
                      <TableRow key={student?.id}>
                        <TableCell className="font-medium">
                          {student?.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student?.name}</p>

                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {student?.age}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student?.school}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student?.parentInfo?.data?.DT?.username}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student?.routeInfo?.data?.DT?.name}:  {student?.routeInfo?.data?.DT?.start_point} -  {student?.routeInfo?.data?.DT?.end_point}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <div className="flex gap-2">
                              {/* Nút Xóa */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteStudent(student)} // Gọi hàm mở dialog
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

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

      {/* Dialog thêm học sinh */}

      {/* Dialog sửa học sinh */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin học sinh</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết của học sinh đang chọn.
            </DialogDescription>
          </DialogHeader>

          {/* Form Chỉnh sửa Học sinh */}
          <div className="space-y-4">
            {/* Hàng 1: Họ và tên & Tuổi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trường Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Họ và tên</Label>
                <Input
                  id="edit-name"
                  value={editStudent.name}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, name: e.target.value })
                  }
                />
              </div>
              {/* Trường Tuổi */}
              <div className="space-y-2">
                <Label htmlFor="edit-age">Tuổi</Label>
                <Input
                  id="edit-age"
                  type="number" // Đảm bảo trường này là số
                  value={editStudent.age}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, age: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Hàng 2: Trường & Phụ huynh */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Trường Học */}
              <div className="space-y-2">
                <Label htmlFor="edit-school">Trường</Label>
                <Input
                  id="edit-school"
                  value={editStudent?.school}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, school: e.target.value })
                  }
                />
              </div>
              {/* Trường Phụ huynh (Select) */}

            </div>

          </div>

          {/* Footer và các nút hành động */}
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStudent} // Hàm xử lý cập nhật (tương tự handleUpdateSchedule)
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Bạn có chắc chắn muốn xóa học sinh{" "}
                <strong>{selectedStudent?.name}</strong>?
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
            <Button variant="destructive" onClick={confirmDeleteStudent}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
