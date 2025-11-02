import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { LeafletMap } from "../map/LeafletMap";
import {
  Users,
  Bus,
  Route,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
} from "lucide-react";

export default function ManagerDashboard() {
  const stats = {
    totalDrivers: 45,
    activeDrivers: 38,
    totalVehicles: 25,
    activeVehicles: 22,
    totalRoutes: 12,
    totalStudents: 1250,
    onTimeRate: 94.5,
    completedTrips: 186,
  };

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Xe 29A-12345 báo cáo sự cố kỹ thuật",
      time: "10 phút trước",
      severity: "medium",
    },
    {
      id: 2,
      type: "info",
      message: "Tài xế Nguyễn Văn Minh yêu cầu nghỉ phép ngày mai",
      time: "30 phút trước",
      severity: "low",
    },
    {
      id: 3,
      type: "urgent",
      message: "Tuyến 3 gặp tắc đường nghiêm trọng",
      time: "1 giờ trước",
      severity: "high",
    },
  ];

  const vehicleStatus = [
    {
      status: "Đang hoạt động",
      count: 22,
      color: "bg-green-500",
      percentage: 88,
    },
    {
      status: "Nghỉ giải lao",
      count: 2,
      color: "bg-yellow-500",
      percentage: 8,
    },
    { status: "Bảo trì", count: 1, color: "bg-blue-500", percentage: 4 },
  ];

  const upcomingSchedules = [
    {
      time: "14:30",
      route: "Tuyến 1",
      driver: "Nguyễn Văn Minh",
      vehicle: "29A-12345",
      students: 42,
    },
    {
      time: "15:00",
      route: "Tuyến 2",
      driver: "Trần Văn Hùng",
      vehicle: "29A-67890",
      students: 38,
    },
    {
      time: "15:30",
      route: "Tuyến 3",
      driver: "Lê Thị Lan",
      vehicle: "29A-11111",
      students: 45,
    },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tài xế</p>
                <p className="font-semibold">
                  {stats.activeDrivers}/{stats.totalDrivers}
                </p>
                <p className="text-xs text-green-600">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xe buýt</p>
                <p className="font-semibold">
                  {stats.activeVehicles}/{stats.totalVehicles}
                </p>
                <p className="text-xs text-green-600">Sẵn sàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Route className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tuyến đường</p>
                <p className="font-semibold">{stats.totalRoutes}</p>
                <p className="text-xs text-purple-600">Đang vận hành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Học sinh</p>
                <p className="font-semibold">
                  {stats.totalStudents.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Đã đăng ký</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Hiệu suất hoạt động hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Tỷ lệ đúng giờ</span>
                    <span className="font-medium">{stats.onTimeRate}%</span>
                  </div>
                  <Progress value={stats.onTimeRate} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Chuyến hoàn thành</span>
                    <span className="font-medium">
                      {stats.completedTrips}/200
                    </span>
                  </div>
                  <Progress
                    value={(stats.completedTrips / 200) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Trạng thái xe buýt</h4>
                {vehicleStatus.map((status, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{status.status}</span>
                        <span className="text-sm font-medium">
                          {status.count} xe
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${status.color}`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch trình sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSchedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{schedule.time}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tuyến</p>
                        <p className="font-medium">{schedule.route}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tài xế</p>
                        <p className="font-medium">{schedule.driver}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Xe</p>
                        <p className="font-medium">{schedule.vehicle}</p>
                      </div>
                    </div>

                    <Badge variant="outline">{schedule.students} HS</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Notifications */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cảnh báo gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.severity === "high"
                        ? "Khẩn cấp"
                        : alert.severity === "medium"
                        ? "Quan trọng"
                        : "Thông tin"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <LeafletMap
              height="280px"
              center={{ lat: 10.8231, lng: 106.6297 }}
              zoom={12}
              markers={[
                {
                  id: "bus1",
                  position: { lat: 10.8231, lng: 106.6297 },
                  title: "Xe 29A-12345",
                  type: "bus",
                  status: "active",
                  info: "Đang hoạt động - Tuyến 1",
                },
                {
                  id: "bus2",
                  position: { lat: 10.835, lng: 106.64 },
                  title: "Xe 29A-67890",
                  type: "bus",
                  status: "active",
                  info: "Đang hoạt động - Tuyến 2",
                },
                {
                  id: "bus3",
                  position: { lat: 10.81, lng: 106.65 },
                  title: "Xe 29A-11111",
                  type: "bus",
                  status: "warning",
                  info: "Tạm dừng - Tuyến 3",
                },
              ]}
              showTraffic={false}
              showControls={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
