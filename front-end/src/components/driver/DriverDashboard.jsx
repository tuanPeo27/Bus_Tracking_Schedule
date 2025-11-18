import React from "react";
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
                <span>{driverInfo?.username || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Mã tài xế:</span>
                <Badge variant="outline">{driverInfo?.id || "—"}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium min-w-[100px]">Điện thoại:</span>
                <span>{driverInfo?.phone_number || "—"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Địa chỉ:</span>
                <span>{driverInfo?.address || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Giới tính:</span>
                <span>{driverInfo?.sex || "—"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Xe đang phụ trách */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            Xe đang phụ trách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Biển số:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {currentVehicle?.bus.license_plate || "—"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Hãng xe:</span>
                <span>{currentVehicle?.bus.brand || "—"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Số ghế:</span>
                <span>{currentVehicle?.bus.seats || "—"} chỗ</span>
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
            Lịch trình hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Thời gian:</span>
              <span>
                {currentVehicle.schedule.start_time} - {currentVehicle.schedule.end_time}
              </span>
            </div>
            <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
          </div>

          <div className="flex items-start gap-2">
            <Route className="w-4 h-4 mt-1" />
            <div>
              <span className="font-medium">Tuyến đường:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {currentVehicle.route.name + ": " + currentVehicle.route.start_point + " - " + currentVehicle.route.end_point}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
