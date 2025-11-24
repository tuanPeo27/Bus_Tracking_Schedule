import React ,{useMemo} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  User,
  Bus,
  Clock,
  MapPin,
  Route,
  Calendar,
  Phone,
  CreditCard,
  Gauge,
} from "lucide-react";

export default function DriverDashboard({ driverInfo, currentVehicle}) {
  // Nếu dữ liệu chưa có -> hiển thị thông báo chờ
  if (!driverInfo || !currentVehicle) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Đang tải dữ liệu tài xế...
      </div>
    );
  }

  const sortedSchedules = useMemo(() => {
    return [...driverInfo.schedules].sort(
      (a, b) => a.start_time.localeCompare(b.start_time)
    );
  }, [driverInfo]);

  // const currentSchedule = {
  //   id: "LT001",
  //   startTime: "07:00",
  //   endTime: "17:00",
  //   route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
  //   status: "active",
  //   progress: 65,
  // };


  return (
    <div className="space-y-6">
      {/* Thông tin tài xế */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin Tài xế
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Họ tên:</span>
                <span>{driverInfo?.driver.username || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Mã tài xế:</span>
                <Badge variant="outline">{driverInfo?.driver.id || "—"}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium min-w-[100px]">Điện thoại:</span>
                <span>{driverInfo?.driver.phone_number || "—"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Địa chỉ:</span>
                <span>{driverInfo?.driver.address || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Giới tính:</span>
                <span>{driverInfo?.driver.sex || "—"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lịch trình hiện tại */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Lịch trình được phân công
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {sortedSchedules.map((sch, index) => (
            <div
              key={sch.id || index}
              className="p-4 border rounded-lg space-y-3 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  Ngày: {sch.date}
                </div>
                {/* <Badge className="bg-green-100 text-green-800">
                  {sch.status || "scheduled"}
                </Badge> */}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Thời gian:</span>
                <span>
                  {sch.start_time} - {sch.end_time}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Route className="w-4 h-4 mt-1" />
                <div>
                  <span className="font-medium">Tuyến đường:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tuyến: {sch.Route?.name || "Không rõ"} <br />
                    Lộ trình: {sch.Route?.start_point} → {sch.Route?.end_point} <br />
                    Xe buýt: {sch.Bus?.license_plate}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {sortedSchedules.length === 0 && (
            <div className="text-center text-gray-500">
              Chưa có lịch trình phân công
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
