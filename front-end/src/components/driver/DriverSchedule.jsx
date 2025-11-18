import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Calendar,
  Clock,
  Bus,
  Eye,
} from "lucide-react";
import { getSchedulesByDriverId } from "../../service/driverService";
import Cookies from "js-cookie";

export default function DriverSchedule({ onAcceptSchedule, activeScheduleId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);

  const getScheduleDriverById = async () => {
    try {
      const res = await getSchedulesByDriverId(Cookies.get("user_id"));
      if (res && res.data.EC === 0) {
        setSchedules(res.data.DT);
        console.log("Tất cả lịch trình của tài xế:", res.data.DT);
      } else {
        console.error("Lỗi lấy danh sách lịch trình:", res?.data?.EM);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy lịch trình:", err);
    }
  };
  

  useEffect(() => {
    getScheduleDriverById();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang thực hiện</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ nhận</Badge>;
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
    if (!searchTerm) return true;
    const keyword = searchTerm.toLowerCase();
    if (!schedule.route) return false;
    return (
      schedule.route.name.toLowerCase().includes(keyword) ||
      schedule.route.start_point.toLowerCase().includes(keyword) ||
      schedule.route.end_point.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tuyến đường</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(schedule.date).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {schedule.start_time} - {schedule.end_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4" />
                      {schedule.route.name + ": " + schedule.route.start_point + " - " + schedule.route.end_point}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onAcceptSchedule(schedule); 
                        }}
                        disabled={activeScheduleId === schedule.id}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {activeScheduleId === schedule.id ? "Đang xem" : "Chi tiết"}
                      </Button>
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
