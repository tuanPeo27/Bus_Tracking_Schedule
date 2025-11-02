import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  User,
  Bus,
  MapPin,
  Clock,
  Route,
  School,
  Phone,
  CheckCircle,
  AlertCircle,
  Navigation,
  Bell,
} from "lucide-react";

export function ParentDashboard({ parentInfo }) {
  const currentStatus = {
    busStatus: "approaching",
    estimatedArrival: "7 phút",
    currentLocation: "Ngã tư Hàng Xanh",
    onTime: true,
    nextStop: "Chợ Thủ Đức",
    distanceToPickup: 2.3,
  };

  const todaySchedule = {
    pickupTime: "07:15",
    dropoffTime: "16:45",
    actualPickup: "07:12",
    actualDropoff: null,
    status: "picked_up",
  };

  const recentTrips = [
    {
      date: "2024-12-18",
      pickupTime: "07:15",
      dropoffTime: "16:45",
      actualPickup: "07:18",
      actualDropoff: "16:42",
      status: "completed",
      onTime: false,
    },
    {
      date: "2024-12-17",
      pickupTime: "07:15",
      dropoffTime: "16:45",
      actualPickup: "07:10",
      actualDropoff: "16:48",
      status: "completed",
      onTime: true,
    },
    {
      date: "2024-12-16",
      pickupTime: "07:15",
      dropoffTime: "16:45",
      actualPickup: "07:15",
      actualDropoff: "16:45",
      status: "completed",
      onTime: true,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approaching":
        return <Badge className="bg-blue-100 text-blue-800">Đang đến</Badge>;
      case "arrived":
        return <Badge className="bg-green-100 text-green-800">Đã đến</Badge>;
      case "picked_up":
        return <Badge className="bg-purple-100 text-purple-800">Đã đón</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const child = parentInfo.children[0]; // Assuming one child for this demo

  return (
    <div className="space-y-6">
      {/* Parent & Child Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin Phụ huynh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-purple-600 text-white text-lg">
                  {parentInfo.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{parentInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Mã phụ huynh: {parentInfo.id}
                </p>
                <Badge variant="outline" className="mt-2">
                  {parentInfo.children.length} con em
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Thông tin Con em
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Tên:</span>
                <span>{child.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Lớp:</span>
                <span>{child.class}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Trường:</span>
                <span className="text-sm">{child.school}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tuyến xe:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {child.route}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Bus Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            Trạng thái xe buýt hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Xe {child.vehicle}</p>
                    <p className="text-sm text-muted-foreground">
                      Tài xế: {child.driver}
                    </p>
                  </div>
                </div>
                {getStatusBadge(currentStatus.busStatus)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Vị trí hiện tại:</span>
                  <span>{currentStatus.currentLocation}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Thời gian đến dự kiến:</span>
                  <span
                    className={
                      currentStatus.onTime ? "text-green-600" : "text-red-600"
                    }
                  >
                    {currentStatus.estimatedArrival}
                    {currentStatus.onTime ? " (Đúng giờ)" : " (Trễ)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Điểm dừng tiếp theo:</span>
                  <span>{currentStatus.nextStop}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Khoảng cách đến điểm đón:</span>
                  <span>{currentStatus.distanceToPickup} km</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Lịch trình hôm nay</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đón (dự kiến):</span>
                  <span className="font-medium">
                    {todaySchedule.pickupTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đón (thực tế):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {todaySchedule.actualPickup || "--:--"}
                    </span>
                    {todaySchedule.actualPickup && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trả (dự kiến):</span>
                  <span className="font-medium">
                    {todaySchedule.dropoffTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trả (thực tế):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {todaySchedule.actualDropoff || "--:--"}
                    </span>
                    {todaySchedule.actualDropoff && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trip History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chuyến đi gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTrips.map((trip, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-medium">
                      {new Date(trip.date).getDate()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Th{new Date(trip.date).getMonth() + 1}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Đón:</span>
                        <span className="font-medium ml-1">
                          {trip.actualPickup}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({trip.pickupTime})
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Trả:</span>
                        <span className="font-medium ml-1">
                          {trip.actualDropoff}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({trip.dropoffTime})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {trip.onTime ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  {getStatusBadge(trip.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium mb-1">Theo dõi trực tiếp</h4>
            <p className="text-sm text-muted-foreground">
              Xem vị trí xe buýt trên bản đồ
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium mb-1">Liên hệ tài xế</h4>
            <p className="text-sm text-muted-foreground">
              Gửi tin nhắn cho tài xế
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium mb-1">Cài đặt thông báo</h4>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh cảnh báo và nhắc nhở
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
