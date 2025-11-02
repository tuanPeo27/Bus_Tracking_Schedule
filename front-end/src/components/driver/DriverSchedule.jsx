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
import {
  Calendar,
  Clock,
  Route,
  Bus,
  MapPin,
  Search,
  Eye,
  Navigation,
} from "lucide-react";

export default function DriverSchedule({ driverId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const schedules = [
    {
      id: "LT001",
      date: "2024-12-19",
      startTime: "07:00",
      endTime: "17:00",
      route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
      vehiclePlate: "29A-12345",
      status: "active",
      totalDistance: 45,
      estimatedTime: "8h 30m",
    },
    {
      id: "LT002",
      date: "2024-12-20",
      startTime: "06:30",
      endTime: "16:30",
      route: "Tuyến 2: Bến xe An Sương - Trường THCS Lê Quý Đôn",
      vehiclePlate: "29A-12345",
      status: "scheduled",
      totalDistance: 38,
      estimatedTime: "7h 45m",
    },
    {
      id: "LT003",
      date: "2024-12-21",
      startTime: "07:15",
      endTime: "17:15",
      route: "Tuyến 3: Chợ Bình Tây - Trường THPT Marie Curie",
      vehiclePlate: "29A-12345",
      status: "scheduled",
      totalDistance: 52,
      estimatedTime: "9h 00m",
    },
    {
      id: "LT004",
      date: "2024-12-18",
      startTime: "07:00",
      endTime: "17:00",
      route: "Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du",
      vehiclePlate: "29A-12345",
      status: "completed",
      totalDistance: 45,
      estimatedTime: "8h 30m",
    },
  ];

  const routeDetails = {
    LT001: {
      stops: [
        { name: "Bến xe Miền Đông", time: "07:00", distance: 0 },
        { name: "Ngã tư Hàng Xanh", time: "07:15", distance: 5 },
        { name: "Cầu Sài Gòn", time: "07:30", distance: 12 },
        { name: "Chợ Thủ Đức", time: "07:45", distance: 18 },
        { name: "Trường THPT Nguyễn Du", time: "08:00", distance: 25 },
      ],
      returnStops: [
        { name: "Trường THPT Nguyễn Du", time: "16:30", distance: 0 },
        { name: "Chợ Thủ Đức", time: "16:45", distance: 7 },
        { name: "Cầu Sài Gòn", time: "17:00", distance: 13 },
        { name: "Bến xe Miền Đông", time: "17:15", distance: 25 },
      ],
    },
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang thực hiện</Badge>
        );
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

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vehiclePlate.includes(searchTerm.toLowerCase()) ||
      schedule.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Lịch trình của tôi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tuyến đường, biển số xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tuyến đường</TableHead>
                <TableHead>Xe</TableHead>
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
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate">{schedule.route}</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.totalDistance} km • {schedule.estimatedTime}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4" />
                      {schedule.vehiclePlate}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSchedule(schedule)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl justify-center items-center">
                        <DialogHeader>
                          <DialogTitle>Chi tiết lịch trình</DialogTitle>
                          <DialogDescription>
                            Xem thông tin chi tiết và trạng thái của lịch trình
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSchedule && (
                          <div className="space-y-6">
                            {/* Schedule Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium">Mã lịch trình</p>
                                <p className="text-muted-foreground">
                                  {selectedSchedule.id}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Ngày thực hiện</p>
                                <p className="text-muted-foreground">
                                  {new Date(
                                    selectedSchedule.date
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Thời gian</p>
                                <p className="text-muted-foreground">
                                  {selectedSchedule.startTime} -{" "}
                                  {selectedSchedule.endTime}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Xe được gán</p>
                                <p className="text-muted-foreground">
                                  {selectedSchedule.vehiclePlate}
                                </p>
                              </div>
                            </div>

                            {/* Route Details */}
                            {routeDetails[selectedSchedule.id] && (
                              <div className="space-y-4">
                                <h4 className="font-medium">
                                  Điểm dừng trên tuyến
                                </h4>

                                <div className="space-y-4">
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">
                                      Lượt đi
                                    </h5>
                                    <div className="space-y-2">
                                      {routeDetails[
                                        selectedSchedule.id
                                      ].stops.map((stop, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                        >
                                          <MapPin className="w-4 h-4 text-blue-600" />
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {stop.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {stop.time} • Cách {stop.distance}{" "}
                                              km
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="text-sm font-medium mb-2">
                                      Lượt về
                                    </h5>
                                    <div className="space-y-2">
                                      {routeDetails[
                                        selectedSchedule.id
                                      ].returnStops.map((stop, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                        >
                                          <MapPin className="w-4 h-4 text-green-600" />
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {stop.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {stop.time} • Cách {stop.distance}{" "}
                                              km
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
