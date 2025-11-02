import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
  DialogDescription,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  Users,
  Search,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Eye,
  School,
} from "lucide-react";

export default function DriverStudents({ driverId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const { showSuccess, showInfo } = useNotificationHelpers();

  // Mock data for students on today's route
  const [students, setStudents] = useState([
    {
      id: "HS001",
      name: "Nguyễn Minh An",
      class: "10A1",
      school: "THPT Nguyễn Du",
      parentName: "Nguyễn Văn Bình",
      parentPhone: "0901234567",
      pickupLocation: "Ngã tư Hàng Xanh",
      dropoffLocation: "THPT Nguyễn Du",
      pickupTime: "07:15",
      dropoffTime: "16:45",
      attendance: "present",
      avatar: "NMA",
    },
    {
      id: "HS002",
      name: "Trần Thị Bảo",
      class: "10A2",
      school: "THPT Nguyễn Du",
      parentName: "Trần Văn Cường",
      parentPhone: "0902345678",
      pickupLocation: "Cầu Sài Gòn",
      dropoffLocation: "THPT Nguyễn Du",
      pickupTime: "07:30",
      dropoffTime: "16:45",
      attendance: "pending",
      avatar: "TTB",
    },
    {
      id: "HS003",
      name: "Lê Hoàng Dũng",
      class: "10B1",
      school: "THPT Nguyễn Du",
      parentName: "Lê Thị Hoa",
      parentPhone: "0903456789",
      pickupLocation: "Chợ Thủ Đức",
      dropoffLocation: "THPT Nguyễn Du",
      pickupTime: "07:45",
      dropoffTime: "16:45",
      attendance: "absent",
      avatar: "LHD",
      notes: "Học sinh báo nghỉ ốm",
    },
    {
      id: "HS004",
      name: "Phạm Mai Linh",
      class: "10A3",
      school: "THPT Nguyễn Du",
      parentName: "Phạm Văn Nam",
      parentPhone: "0904567890",
      pickupLocation: "Ngã tư Hàng Xanh",
      dropoffLocation: "THPT Nguyễn Du",
      pickupTime: "07:15",
      dropoffTime: "16:45",
      attendance: "present",
      avatar: "PML",
    },
    {
      id: "HS005",
      name: "Võ Thanh Tùng",
      class: "10B2",
      school: "THPT Nguyễn Du",
      parentName: "Võ Thị Lan",
      parentPhone: "0905678901",
      pickupLocation: "Bến xe Miền Đông",
      dropoffLocation: "THPT Nguyễn Du",
      pickupTime: "07:00",
      dropoffTime: "16:45",
      attendance: "pending",
      avatar: "VTT",
    },
  ]);

  const updateAttendance = (studentId, attendance) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, attendance } : s))
    );

    // Hiển thị thông báo dựa trên trạng thái
    if (attendance === "present") {
      showSuccess(
        `Xác nhận thành công`,
        `${student.name} đã được đánh dấu có mặt`
      );
    } else {
      showInfo(
        `Cập nhật điểm danh`,
        `${student.name} đã được đánh dấu vắng mặt`
      );
    }
  };

  const getAttendanceBadge = (attendance) => {
    switch (attendance) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Có mặt</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Vắng mặt</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>
        );
    }
  };

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      attendanceFilter === "all" || student.attendance === attendanceFilter;

    return matchesSearch && matchesFilter;
  });

  const attendanceStats = {
    total: students.length,
    present: students.filter((s) => s.attendance === "present").length,
    absent: students.filter((s) => s.attendance === "absent").length,
    pending: students.filter((s) => s.attendance === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{attendanceStats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceStats.present}
                </p>
                <p className="text-sm text-muted-foreground">Có mặt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {attendanceStats.absent}
                </p>
                <p className="text-sm text-muted-foreground">Vắng mặt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {attendanceStats.pending}
                </p>
                <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Danh sách học sinh hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học sinh, lớp, điểm đón..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={attendanceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={attendanceFilter === "present" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("present")}
                className="bg-green-600 hover:bg-green-700"
              >
                Có mặt
              </Button>
              <Button
                variant={attendanceFilter === "absent" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("absent")}
                className="bg-red-600 hover:bg-red-700"
              >
                Vắng mặt
              </Button>
              <Button
                variant={attendanceFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("pending")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Chờ xác nhận
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Điểm đón/trả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          {student.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.class} • {student.school}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{student.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <School className="w-4 h-4 text-blue-600" />
                        <span>{student.dropoffLocation}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Đón: {student.pickupTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Trả: {student.dropoffTime}</span>
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
                            onClick={() =>
                              updateAttendance(student.id, "present")
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Có mặt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() =>
                              updateAttendance(student.id, "absent")
                            }
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Vắng
                          </Button>
                        </>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Thông tin học sinh</DialogTitle>
                            <DialogDescription>
                              Xem thông tin chi tiết và trạng thái của học sinh
                            </DialogDescription>
                          </DialogHeader>
                          {selectedStudent && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-800">
                                    {selectedStudent.avatar}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {selectedStudent.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedStudent.class} •{" "}
                                    {selectedStudent.school}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <p className="font-medium">Phụ huynh:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedStudent.parentName}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">Số điện thoại:</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                      {selectedStudent.parentPhone}
                                    </p>
                                    <Button size="sm" variant="outline">
                                      <Phone className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">Điểm đón:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedStudent.pickupLocation} (
                                    {selectedStudent.pickupTime})
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">Điểm trả:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedStudent.dropoffLocation} (
                                    {selectedStudent.dropoffTime})
                                  </p>
                                </div>
                                {selectedStudent.notes && (
                                  <div>
                                    <p className="font-medium">Ghi chú:</p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedStudent.notes}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {selectedStudent.attendance === "pending" && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      updateAttendance(
                                        selectedStudent.id,
                                        "present"
                                      );
                                      setSelectedStudent(null);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Xác nhận có mặt
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      updateAttendance(
                                        selectedStudent.id,
                                        "absent"
                                      );
                                      setSelectedStudent(null);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Xác nhận vắng
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
