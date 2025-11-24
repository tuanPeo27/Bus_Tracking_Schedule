import React from "react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
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
import { getAllBus, getAllDriver, getAllRoute, getAllSchedule, getAllStudent, getInfoBus, getInfoRoute, getInfoStudentByRouteId, getInfoDriver } from "../../service/adminService";

export default function ManagerDashboard() {
  const [allDriverInfo, setAllDriverInfo] = useState("");
  const [allScheduleInfo, setAllScheduleInfo] = useState("");
  const [allBusInfo, setAllBusInfo] = useState("");
  const [allRouteInfo, setAllRouteInfo] = useState("");
  const [allStudentInfo, setAllStudentInfo] = useState("");
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  const getAllSchedules = async () => {
    try {
      const res = await getAllSchedule();
      if (res && res.data.EC === 0) {
        setAllScheduleInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch trình:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  };

  const getAllDrivers = async () => {
    try {
      const res = await getAllDriver();
      if (res && res.data.EC === 0) {
        setAllDriverInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài xế:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  };

  const getAllBuses = async () => {
    try {
      const res = await getAllBus();
      if (res && res.data.EC === 0) {
        setAllBusInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xe bus:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  const getAllRoutes = async () => {
    try {
      const res = await getAllRoute();
      if (res && res.data.EC === 0) {
        setAllRouteInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tuyến đường:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  const getAllStudents = async () => {
    try {
      const res = await getAllStudent();
      if (res && res.data.EC === 0) {
        setAllStudentInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  const getUpcomingSchedules = async () => {
    try {
      const res = await getAllSchedule();
      if (res && res.data.EC === 0 && Array.isArray(res.data.DT)) {
        const now = new Date();

        const top3 = res.data.DT
          .map(item => {
            const [hour, minute, second] = item.start_time.split(":").map(Number);
            const [year, month, day] = item.date.split("-").map(Number);
            // Chuyển thành Date
            const scheduleDateTime = new Date(year, month - 1, day, hour, minute, second);
            return { ...item, scheduleDateTime };
          })
          // Chỉ giữ các lịch sắp tới
          .filter(item => item.scheduleDateTime > now)
          // Sắp xếp gần nhất lên đầu
          .sort((a, b) => a.scheduleDateTime - b.scheduleDateTime)
          // Lấy tối đa 3 cái
          .slice(0, 3);

        const top3Upcoming = await Promise.all(
          top3.map(async item => {
            const routeInfo = await getInfoRoute(item.route_id); // giả sử API trả về object
            const busInfo = await getInfoBus(item.bus_id);
            const studentInfo = await getInfoStudentByRouteId(routeInfo.data.DT.id);
            const driverInfo = await getInfoDriver(item.driver_id);
            return { ...item, routeInfo, busInfo, studentInfo, driverInfo };
          })
        );

        console.log("Top 3 upcoming schedules:", top3Upcoming);
        setUpcomingSchedules(top3Upcoming);
        return top3Upcoming;
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch trình:", error);
    }
  };



  useEffect(() => {
    getAllDrivers();
    getAllBuses();
    getAllRoutes();
    getAllStudents();
    getUpcomingSchedules();
    getAllSchedules();
  }, []);



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
                  {allDriverInfo["length"]}
                </p>
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
                  {allBusInfo["length"]}
                </p>
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
                <p className="font-semibold">{allRouteInfo["length"]}</p>
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
                  {allStudentInfo["length"]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 space-y-6">

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
                      <span className="font-medium">{schedule.start_time}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tuyến</p>
                        <p className="font-medium">
                          {schedule.routeInfo?.data?.DT?.name} : {schedule.routeInfo?.data?.DT?.start_point}-{schedule.routeInfo?.data?.DT?.end_point}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tài xế</p>
                        <p className="font-medium">{schedule.driverInfo?.data?.DT?.driver?.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Xe</p>
                        <p className="font-medium">{schedule.busInfo?.data?.DT?.brand}-{schedule.busInfo?.data?.DT?.model}</p>
                      </div>
                    </div>

                    <Badge variant="outline">{schedule.studentInfo?.data?.DT["length"]} HS</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}
