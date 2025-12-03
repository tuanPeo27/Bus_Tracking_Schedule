import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Cookies from "js-cookie";
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
  DialogDescription,
} from "../ui/dialog";
import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  School,
  Route,
} from "lucide-react";
import { getStudentsByScheduleId } from "../../service/driverService";

export default function DriverStudents({ scheduleId }) {
  //state cho hoc sinh, hoc sinh duoc chon, loc diem danh
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const { showSuccess, showInfo } = useNotificationHelpers();

  //khoi tao state cho danh sach hoc sinh
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem('driverStudents');
    return savedStudents ? JSON.parse(savedStudents) : [];
  });
  //state cho loading
  const [isLoading, setIsLoading] = useState(false);
  //state cho thong tin lich trinh
  const [scheduleInfo, setScheduleInfo] = useState(null);
  //ham lay danh sach hoc sinh theo scheduleId
  const fetchStudentsForSchedule = async (id) => {
    if (id === null || id === undefined || id === "") {
      console.warn("scheduleId không hợp lệ, bỏ qua fetch. Giá trị hiện tại:", id, "Type:", typeof id);
      return;
    }
    console.log("scheduleId hợp lệ, bắt đầu fetch:", id);
    setIsLoading(true);
    try {
      const response = await getStudentsByScheduleId(id);
      console.log("Response từ API:", response);
      if (response && response.data && response.data.EC === 0) {
        const data = response.data.DT;
        console.log("Dữ liệu DT:", data);
        //cap nhat thong tin lich trinh
        setScheduleInfo({
          schedule_id: data.schedule_id,
          route_id: data.route_id,
        });
        //xu ly danh sach hoc sinh
        const studentsFromApi = Array.isArray(data.students) ? data.students : [];
        console.log("studentsFromApi:", studentsFromApi);
        //kiem tra va cap nhat state
        if (studentsFromApi.length > 0) {
          const studentsWithAttendance = studentsFromApi.map((student) => {
            if (!student || typeof student !== "object") {
              console.warn("Student không hợp lệ:", student);
              return null;
            }
            return {
              ...student,
              attendance: "pending",
            };
          }).filter(Boolean);

          console.log("studentsWithAttendance:", studentsWithAttendance);
          //chi cap nhat neu co student hop le
          if (studentsWithAttendance.length > 0) {
            setStudents(studentsWithAttendance); // Set state và lưu vào localStorage
            localStorage.setItem('driverStudents', JSON.stringify(studentsWithAttendance)); // Lưu lại
          } else {
            console.warn("Không có student hợp lệ, giữ state cũ.");
          }
        } else {
          console.warn("data.students rỗng, giữ state cũ.");
        }
      } else {
        const errorMsg = response?.data?.EM || "Lỗi không xác định từ API";
        console.error("Lỗi lấy danh sách học sinh:", errorMsg);
        showInfo("Lỗi tải dữ liệu", errorMsg);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
      showInfo("Lỗi mạng", "Không thể tải danh sách học sinh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  //useEffect de lay danh sach hoc sinh khi scheduleId thay doi
  useEffect(() => {
    console.log("useEffect chạy với scheduleId:", scheduleId, "Type:", typeof scheduleId);
    fetchStudentsForSchedule(scheduleId);
  }, [scheduleId]);
  //useEffect de luu danh sach hoc sinh vao localstorage khi co thay doi
  useEffect(() => {
    console.log("Học sinh SAU KHI set (state hiện tại):", students);
  }, [students]);
  //ham cap nhat diem danh
  const updateAttendance = (studentId, attendance) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    //cap nhat state
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, attendance } : s))
    );

    if (attendance === "present") {
      showSuccess(`Xác nhận thành công`, `${student.name} đã được đánh dấu có mặt`);
    } else {
      showInfo(`Cập nhật điểm danh`, `${student.name} đã được đánh dấu vắng mặt`);
    }
  };
  //ham hien thi badge diem danh
  const getAttendanceBadge = (attendance) => {
    switch (attendance) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Có mặt</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Vắng mặt</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>;
      default:
        return <Badge variant="outline">Chưa rõ</Badge>;
    }
  };
  //ham hien thi icon diem danh
  const getAttendanceIcon = (attendance) => {
    switch (attendance) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };
  //loc danh sach hoc sinh theo diem danh
  const studentList = Array.isArray(students) ? students : [];
  //loc theo attendanceFilter
  const filteredStudents = studentList.filter((student) => {
    if (!student || typeof student !== "object") {
      return false;
    }
    
    const matchesFilter =
      attendanceFilter === "all" || student.attendance === attendanceFilter;

    return matchesFilter;
  });

  console.log("GIÁ TRỊ LỌC CUỐI CÙNG:", {
    attendanceFilter: attendanceFilter,
    studentsLength: studentList.length,
    filteredLength: filteredStudents.length,
  });

  if (isLoading) {
    return <div className="text-center p-4">Đang tải danh sách học sinh...</div>;
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Không có học sinh nào trong lịch trình này. (Nếu đã có dữ liệu trước đó, hãy kiểm tra scheduleId.)
      </div>
    );
  }

  //render giao dien
  return (
    <div className="space-y-4">
      {scheduleInfo && (
        <Card className="border border-blue-200 bg-blue-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-600" />
              Thông tin lịch trình
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <p>
              <strong>Mã lịch trình:</strong> {scheduleInfo.schedule_id}
            </p>
            <p>
              <strong>Mã tuyến đường:</strong> {scheduleInfo.route_id}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Điểm đón/trả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.school || "Không rõ trường"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{student.pickup_point}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <School className="w-4 h-4 text-blue-600" />
                        <span>{student.dropoff_point}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getAttendanceIcon(student.attendance)}
                      {getAttendanceBadge(student.attendance)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {student.attendance === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateAttendance(student.id, "present")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Có mặt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateAttendance(student.id, "absent")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Vắng
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
