import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
import socket from "../setup/socket";
//khai bao state
export function DriverApp({ onBack }) {
  //quan ly tab hien thi
  const [activeTab, setActiveTab] = useState("dashboard");
  //luu lich trinh dang chon
  const [activeSchedule, setActiveSchedule] = useState(null);
  //trang thai tai xe
  const [driverStatus, setDriverStatus] = useState("active");
  //thong tin tai xe va xe
  const [driverInfo, setDriverInfo] = useState(null);
  //thong tin xe
  const [currentVehicle, setVehicleInfo] = useState(null);
  //thong bao va ui
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();
  //danh sach thong bao 
  const [notificationsList, setNotificationsList] = useState([]);
  //dem so thong bao chua doc
  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  //lay thong tin tai xe tu server  
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

  //lay thong tin xe tu server
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
  //load thong tin khi component duoc mount lan dau
  useEffect(() => {
    getDriverInfo();
    getVehicleInfo();
  }, []);

  //load thong bao tu localstorage khi thong tin tai xe thay doi
  useEffect(() => {
    console.log("driverInfo changed:", driverInfo);
    if (!driverInfo?.driver.id) return;

    const saved = localStorage.getItem(`notifications_${driverInfo.driver.id}`);
    setNotificationsList(saved ? JSON.parse(saved) : []);
  }, [driverInfo?.driver.id]);

  //lang nghe thong bao qua socket khi thong tin tai xe thay doi
  useEffect(() => {
    if (!driverInfo?.driver.id) return;

    const handleNotification = (notification) => {
      const newNotification = {
        id: Date.now(),
        title: notification?.title || "Thông báo mới",
        content:
          typeof notification === "string"
            ? notification
            : notification?.message || String(notification),
        timestamp: new Date(),
        isRead: false,
        type: notification?.type || "info",
      };

      //cap nhat state va luu vao localstorage
      setNotificationsList((prev) => {
        const updated = [newNotification, ...prev];
        localStorage.setItem(
          `notifications_${driverInfo.driver.id}`,
          JSON.stringify(updated)
        );
        return updated;
      });

      showSuccess(newNotification.title, newNotification.content);
    };

    //lang nghe su kien thong bao cho tung tai xe
    socket.on(`notification-${driverInfo.driver.id}`, handleNotification);
    //don dep su kien khi component unmount hoac driverId thay doi
    return () => {
      socket.off(`notification-${driverInfo.driver.id}`, handleNotification);
    };
  }, [driverInfo?.driver.id]);


  //xy ly dang xuat
  const handleLogout = () => {
    clearAll();
    system.logout();
    if (typeof onBack === "function") onBack();
  };

  //xy ly chon lich trinh chuyen sang tab hoc sinh
  const handleAcceptSchedule = (schedule) => {
    console.log("Đã chọn lịch trình:", schedule);
    setActiveSchedule(schedule);
    setActiveTab("students");
  };

  //ham hien thi mau trang thai
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

  //ham noi dung trang thai
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
  //render giao dien
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

      {/* tab chuyen doi */}
      <div className="border-b border-gray-200 bg-white">
        <div className={isMobile ? "px-2" : "px-4"}>
          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsList
              className={`${
                isMobile ? "h-16 w-full justify-start overflow-x-auto" : "h-12"
              } bg-transparent border-0`}
            >
              {/* cac tab chinh */}
              <AnimatedTabsTrigger value="dashboard">
                <User className="w-4 h-4" />
                {isMobile ? "Tổng quan" : "Tổng quan"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="schedule">
                <Calendar className="w-4 h-4" />
                {isMobile ? "Lịch" : "Lịch trình"}
              </AnimatedTabsTrigger>

              {/* khi chon lich trinh moi hien thi tab hoc sinh va gps */}
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
                
                  {unreadCount > 0 && (
                  <Badge
                    className={`bg-red-500 text-white text-xs px-1.5 py-0.5 ${
                    isMobile
                    ? "absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0"
                    : "ml-1"
                    }`}
                  >
                  {unreadCount}
                  </Badge>
                )}
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
          {/* tong quan */}
          <AnimatedTabsContent value="dashboard">
            <DriverDashboard
              driverInfo={driverInfo}
              currentVehicle={currentVehicle}

            />
          </AnimatedTabsContent>
          {/* lich trinh */}
          <AnimatedTabsContent value="schedule">
            <DriverSchedule
              onAcceptSchedule={handleAcceptSchedule}
              activeScheduleId={activeSchedule?.id}
            />
          </AnimatedTabsContent>
          
          {/* render chi tiet hoc sinh va gps neu da chon lich trinh */}
          {activeSchedule ? (
            <>
              <AnimatedTabsContent value="students">
                <DriverStudents scheduleId={activeSchedule.id} />
              </AnimatedTabsContent>

              <AnimatedTabsContent value="gps">
                <DriverGPS
                  schedule_id={activeSchedule?.id}
                  route_id={activeSchedule?.route?.id || activeSchedule?.route_id}
                  vehicle_id={activeSchedule?.bus?.id || currentVehicle?.id}
                  vehicle={activeSchedule?.bus || currentVehicle}
                />
              </AnimatedTabsContent>
            </>
          ) : (
            // neu chua chon lich trinh hien thi thong bao
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
          {/* thong bao */}
          <AnimatedTabsContent value="notifications">
            <DriverNotifications driverId={driverInfo?.driver.id}
              notificationsList={notificationsList}
              setNotificationsList={setNotificationsList}
           />
          </AnimatedTabsContent>
          {/* doi mat khau */}
          <AnimatedTabsContent value="password">
            <ChangePassword userRole={Cookies.get("user_role")} />
          </AnimatedTabsContent>
        </AnimatedTabs>
      </main>
    </div>
  );
}
