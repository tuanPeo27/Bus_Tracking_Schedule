import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
} from "./ui/animated-tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useNotificationHelpers } from "./useNotificationHelpers";
import { useNotifications } from "./NotificationContext";
import { useIsMobile } from "./ui/use-mobile";
import {
  User,
  Bus,
  Clock,
  MapPin,
  Bell,
  LogOut,
  Navigation,
  Calendar,
  Route,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  KeyRound,
} from "lucide-react";
import DriverDashboard from "./driver/DriverDashboard";
import DriverSchedule from "./driver/DriverSchedule";
import DriverGPS from "./driver/DriverGPS";
import DriverNotifications from "./driver/DriverNotifications";
import DriverStatus from "./driver/DriverStatus";
import DriverStudents from "./driver/DriverStudents";
import { ChangePassword } from "./ChangePassword";

export function DriverApp({ onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [driverStatus, setDriverStatus] = useState("active");
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    clearAll(); // Clear all notifications
    system.logout();
    onBack();
  };

  const driverInfo = {
    id: "TX001",
    name: "Nguyễn Văn Minh",
    birthDate: "1985-03-15",
    gender: "Nam",
    licenseNumber: "B2-123456789",
    phone: "0912345678",
    avatar: "NVM",
  };

  const currentVehicle = {
    id: "XE001",
    licensePlate: "29A-12345",
    brand: "Hyundai Universe",
    seats: 45,
    avgSpeed: 35,
    status: "active",
  };

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-green-600" />
              <div>
                <h1 className={`${isMobile ? "text-base" : "text-lg"}`}>
                  {isMobile ? "Tài xế" : "Giao diện Tài xế"}
                </h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Chào mừng, {driverInfo.name}
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
                  {driverInfo.avatar}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={handleLogout}
                className={isMobile ? "px-2" : ""}
              >
                <LogOut className="w-4 h-4" />
                {!isMobile && <span className="ml-2">Đăng xuất</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className={isMobile ? "px-2" : "px-4"}>
          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsList
              className={`${
                isMobile ? "h-16 w-full justify-start" : "h-12"
              } bg-transparent border-0 ${isMobile ? "overflow-x-auto" : ""}`}
            >
              <AnimatedTabsTrigger
                value="dashboard"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <User className="w-4 h-4" />
                {isMobile ? "Tổng quan" : "Tổng quan"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="schedule"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <Calendar className="w-4 h-4" />
                {isMobile ? "Lịch" : "Lịch trình"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="students"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <Users className="w-4 h-4" />
                {isMobile ? "H.sinh" : "Học sinh"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="gps"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <Navigation className="w-4 h-4" />
                {isMobile ? "GPS" : "Theo dõi GPS"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="notifications"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <Bell className="w-4 h-4" />
                {isMobile ? "T.báo" : "Thông báo"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="status"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                {isMobile ? "T.thái" : "Trạng thái"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="password"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {isMobile ? "Đổi MK" : "Đổi mật khẩu"}
              </AnimatedTabsTrigger>
            </AnimatedTabsList>
          </AnimatedTabs>
        </div>
      </div>

      {/* Main Content */}
      <main className={isMobile ? "p-2" : "p-4"}>
        <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
          <AnimatedTabsContent value="dashboard" className="mt-0">
            <DriverDashboard
              driverInfo={driverInfo}
              currentVehicle={currentVehicle}
              driverStatus={driverStatus}
            />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="schedule" className="mt-0">
            <DriverSchedule driverId={driverInfo.id} />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="students" className="mt-0">
            <DriverStudents driverId={driverInfo.id} />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="gps" className="mt-0">
            <DriverGPS vehicleId={currentVehicle.id} />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="notifications" className="mt-0">
            <DriverNotifications driverId={driverInfo.id} />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="status" className="mt-0">
            <DriverStatus
              currentStatus={driverStatus}
              onStatusChange={setDriverStatus}
            />
          </AnimatedTabsContent>

          <AnimatedTabsContent value="password" className="mt-0">
            <ChangePassword userRole={Cookies.get("user_role")} />
          </AnimatedTabsContent>
        </AnimatedTabs>
      </main>
    </div>
  );
}
