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

export default function DriverDashboard({ driverInfo, currentVehicle, driverStatus }) {
  // Nếu dữ liệu chưa có -> hiển thị thông báo chờ
  if (!driverInfo || !currentVehicle) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Đang tải dữ liệu tài xế...
      </div>
    );
  }

  const currentSchedule = {
    id: "LT001",
    startTime: "07:00",
    endTime: "17:00",
    route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
    status: "active",
    progress: 65,
  };

  const todayStats = {
    totalDistance: 125,
    completedTrips: 8,
    totalTrips: 12,
    onTimeRate: 95,
  };

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
              {/* <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium min-w-[100px]">Số GPLX:</span>
                <span>{driverInfo?.licenseNumber || "—"}</span>
              </div> */}
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Giới tính:</span>
                <span>{driverInfo?.sex || "—"}</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium min-w-[100px]">Ngày sinh:</span>
                <span>
                  {driverInfo?.birthDate
                    ? new Date(driverInfo.birthDate).toLocaleDateString("vi-VN")
                    : "—"}
                </span>
              </div> */}
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
                  {currentVehicle?.licensePlate || "—"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Hãng xe:</span>
                <span>{currentVehicle?.brand || "—"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Số ghế:</span>
                <span>{currentVehicle?.seats || "—"} chỗ</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span className="font-medium min-w-[100px]">Tốc độ TB:</span>
                <span>{currentVehicle?.avgSpeed || 0} km/h</span>
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
                {currentSchedule.startTime} - {currentSchedule.endTime}
              </span>
            </div>
            <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
          </div>

          <div className="flex items-start gap-2">
            <Route className="w-4 h-4 mt-1" />
            <div>
              <span className="font-medium">Tuyến đường:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSchedule.route}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Tiến độ hành trình:</span>
              <span className="text-sm">{currentSchedule.progress}%</span>
            </div>
            <Progress value={currentSchedule.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Thống kê hôm nay */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Quãng đường</p>
                <p className="font-medium">{todayStats.totalDistance} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Chuyến đi</p>
                <p className="font-medium">
                  {todayStats.completedTrips}/{todayStats.totalTrips}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Đúng giờ</p>
                <p className="font-medium">{todayStats.onTimeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  driverStatus === "active"
                    ? "bg-green-500"
                    : driverStatus === "break"
                    ? "bg-yellow-500"
                    : driverStatus === "incident"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              />
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="font-medium">
                  {driverStatus === "active"
                    ? "Hoạt động"
                    : driverStatus === "break"
                    ? "Nghỉ"
                    : driverStatus === "incident"
                    ? "Sự cố"
                    : "Ngoại tuyến"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
