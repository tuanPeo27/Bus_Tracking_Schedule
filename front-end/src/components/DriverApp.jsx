import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useNotificationHelpers } from "./useNotificationHelpers";
import { useNotifications } from "./NotificationContext";
import { useIsMobile } from "./ui/use-mobile";
import {
  Bus,
  LogOut,
  Bell,
  Navigation,
  Calendar,
  AlertCircle,
  Users,
  KeyRound,
  User,
} from "lucide-react";
import {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
} from "./ui/animated-tabs";
import DriverDashboard from "./driver/DriverDashboard";
import DriverSchedule from "./driver/DriverSchedule";
import DriverGPS from "./driver/DriverGPS";
import DriverNotifications from "./driver/DriverNotifications";
import DriverStatus from "./driver/DriverStatus";
import DriverStudents from "./driver/DriverStudents";
import { ChangePassword } from "./ChangePassword";
import {
  getInfoDriver,
  getInfoVehicle,
  getDriverSchedule,
} from "../service/driverService";
import Cookies from "js-cookie";

export function DriverApp({ onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [driverStatus, setDriverStatus] = useState("active");
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentVehicle, setVehicleInfo] = useState(null);
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();

  // Lấy thông tin tài xế từ server
  const getDriverInfo = async () => {
    try {
      const res = await getInfoDriver(Cookies.get("user_id"));
      if (res && res.data.EC === 0) {
        console.log("res.data", res.data);
        setDriverInfo(res.data.DT);
        console.log("Thông tin tài xế:", res.data.DT);
      } else {
        console.error("Lỗi lấy thông tin tài xế:", res?.data?.EM);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy thông tin tài xế:", err);
    }
  };

  // Lấy thông tin xe từ server
  const getVehicleInfo = async () => {
    try {
      const res = await getInfoVehicle(Cookies.get("user_id"));
      if (res && res.data.EC === 0) {
        setVehicleInfo(res.data.DT);
        console.log("Thông tin xe:", res.data.DT);
      } else {
        console.error("Lỗi lấy thông tin xe:", res?.data?.EM);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy thông tin xe:", err);
    }
  };

  useEffect(() => {
    getDriverInfo();
    getVehicleInfo();
  }, []);

  // Đăng xuất
  const handleLogout = () => {
    clearAll();
    system.logout();
    if (typeof onBack === "function") onBack();
  };

  const handleAcceptSchedule = (schedule) => {
    console.log("Đã chọn lịch trình:", schedule);
    setActiveSchedule(schedule);
    setActiveTab("students");
  };

  // Khi tài xế hoàn thành chuyến đi
  // const handleCompleteSchedule = () => {
  //   if (activeSchedule) {
  //     system.success(
  //       "Hoàn thành chuyến đi",
  //       `Đã kết thúc lịch trình ${activeSchedule.id}.`
  //     );
  //   }
  //   setActiveSchedule(null);
  //   setActiveTab("schedule");
  // };

  // Hàm hiển thị màu trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "break":
        return "bg-yellow-500";
      case "incident":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "";
    }
  };

  //  Hàm hiển thị nội dung trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "break":
        return "Nghỉ giải lao";
      case "incident":
        return "Sự cố";
      case "offline":
        return "Ngoại tuyến";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-8 h-8 text-green-600" />
            <div>
              <h1 className={isMobile ? "text-base" : "text-lg"}>
                {isMobile ? "Tài xế" : "Giao diện Tài xế"}
              </h1>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Chào mừng, {driverInfo?.driver.username || "Đang tải..."}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && (
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    driverStatus
                  )}`}
                />
                <span className="text-sm">{getStatusText(driverStatus)}</span>
              </div>
            )}
            <Avatar className={isMobile ? "w-8 h-8" : ""}>
              <AvatarFallback className={isMobile ? "text-sm" : ""}>
                {driverInfo?.avatar || "DRV"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={isMobile ? "px-2" : ""}
            >
              <LogOut className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <div className="border-b border-gray-200 bg-white">
        <div className={isMobile ? "px-2" : "px-4"}>
          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsList
              className={`${
                isMobile ? "h-16 w-full justify-start overflow-x-auto" : "h-12"
              } bg-transparent border-0`}
            >
              {/* Các Tab chính */}
              <AnimatedTabsTrigger value="dashboard">
                <User className="w-4 h-4" />
                {isMobile ? "Tổng quan" : "Tổng quan"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="schedule">
                <Calendar className="w-4 h-4" />
                {isMobile ? "Lịch" : "Lịch trình"}
              </AnimatedTabsTrigger>

              {activeSchedule && (
                <>
                  <AnimatedTabsTrigger value="students">
                    <Users className="w-4 h-4" />
                    {isMobile ? "H.sinh" : "Học sinh"}
                  </AnimatedTabsTrigger>

                  <AnimatedTabsTrigger value="gps">
                    <Navigation className="w-4 h-4" />
                    {isMobile ? "GPS" : "Theo dõi GPS"}
                  </AnimatedTabsTrigger>
                </>
              )}

              <AnimatedTabsTrigger value="notifications">
                <Bell className="w-4 h-4" />
                {isMobile ? "T.báo" : "Thông báo"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="status">
                <AlertCircle className="w-4 h-4" />
                {isMobile ? "T.thái" : "Trạng thái"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="password">
                <KeyRound className="w-4 h-4" />
                {isMobile ? "Đổi MK" : "Đổi mật khẩu"}
              </AnimatedTabsTrigger>
            </AnimatedTabsList>
          </AnimatedTabs>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className={isMobile ? "p-2" : "p-4"}>
        <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
          <AnimatedTabsContent value="dashboard">
            <DriverDashboard
              driverInfo={driverInfo}
              currentVehicle={currentVehicle}

            />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="schedule">
            <DriverSchedule
              onAcceptSchedule={handleAcceptSchedule}
              activeScheduleId={activeSchedule?.id}
            />
          </AnimatedTabsContent>

          {activeSchedule ? (
            <>
              <AnimatedTabsContent value="students">
                <DriverStudents scheduleId={activeSchedule.id} />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="gps">
                <DriverGPS
                  schedule_id={activeSchedule?.id}
                  route_id={activeSchedule?.route?.id || activeSchedule?.route_id}
                  // some API return vehicle nested under `bus`, so prefer that if present
                  vehicle_id={activeSchedule?.bus?.id || currentVehicle?.id}
                  vehicle={activeSchedule?.bus || currentVehicle}
                />
              </AnimatedTabsContent>
            </>
          ) : (
            <>
              <AnimatedTabsContent value="students">
                <p className="p-4 text-center text-gray-500">
                  Hãy chọn một lịch trình để xem chi tiết.
                </p>
              </AnimatedTabsContent>
              <AnimatedTabsContent value="gps">
                <p className="p-4 text-center text-gray-500">
                  Hãy chọn một lịch trình để xem chi tiết.
                </p>
              </AnimatedTabsContent>
            </>
          )}

          <AnimatedTabsContent value="notifications">
            <DriverNotifications driverId={driverInfo?.id} />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="status">
            <DriverStatus
              currentStatus={driverStatus}
              onStatusChange={setDriverStatus}
            />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="password">
            <ChangePassword userRole={Cookies.get("user_role")} />
          </AnimatedTabsContent>
        </AnimatedTabs>
      </main>
    </div>
  );
}
