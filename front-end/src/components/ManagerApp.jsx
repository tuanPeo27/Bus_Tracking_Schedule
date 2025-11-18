import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
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
  Users,
  Bus,
  Calendar,
  MapPin,
  Bell,
  LogOut,
  LayoutDashboard,
  Route,
  UserCheck,
  MessageSquare,
  BarChart3,
  GraduationCap,
  KeyRound,
} from "lucide-react";
import ManagerDashboard from "./manager/ManagerDashboard";
import ManagerSchedules from "./manager/ManagerSchedules";
import ManagerDrivers from "./manager/ManagerDrivers";
import ManagerVehicles from "./manager/ManagerVehicles";
import ManagerRoutes from "./manager/ManagerRoutes";
import ManagerTracking from "./manager/ManagerTracking";
import ManagerMessages from "./manager/ManagerMessages";
import ManagerStudents from "./manager/ManagerStudents";
import { ChangePassword } from "./ChangePassword";
import { getInfoAdmin } from "../service/adminService";

export function ManagerApp({ onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();
  const [adminInfo, setAdminInfo] = useState("");

  const handleLogout = () => {
    clearAll(); // Clear tất cả notifications trước khi logout
    system.logout();
    onBack();
  };

  const getAdmin = async () => {
    try {
      const res = await getInfoAdmin(Cookies.get("user_id"));

      if (res && res.data.EC === 0) {
        setAdminInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quản lý:", error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

  // const adminInfo = {
  //   id: "QL001",
  //   name: "Nguyễn Văn Quản",
  //   role: "Quản lý Điều hành",
  //   avatar: "NVQ",
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className={`${isMobile ? "text-base" : "text-lg"}`}>
                  {isMobile ? "Quản lý" : "Giao diện Quản lý"}
                </h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Hệ thống quản lý xe buýt
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {!isMobile && (
                <Badge className="bg-blue-100 text-blue-800">Quản lý</Badge>
              )}

              <Avatar className={isMobile ? "w-8 h-8" : ""}>
                <AvatarFallback className="bg-blue-600 text-white">
                  {adminInfo.username
                    ? adminInfo.username.charAt(0).toUpperCase()
                    : "A"}
                </AvatarFallback>
              </Avatar>

              {!isMobile && (
                <div className="text-right">
                  <p className="font-medium">{adminInfo.username}</p>
                  <p className="text-sm text-muted-foreground">Quản lý</p>
                </div>
              )}

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
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className={isMobile ? "px-2" : "px-4"}>
          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsList
              className={`${
                isMobile ? "h-16 w-full justify-start" : "h-12"
              } bg-transparent border-0 ${
                isMobile
                  ? "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  : ""
              }`}
            >
              <AnimatedTabsTrigger
                value="dashboard"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {isMobile ? "Tổng" : "Tổng quan"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="schedules"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <Calendar className="w-4 h-4" />
                {isMobile ? "Lịch" : "Lịch trình"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="students"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {isMobile ? "H.sinh" : "Học sinh"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="drivers"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {isMobile ? "T.xế" : "Tài xế"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="vehicles"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <Bus className="w-4 h-4" />
                {isMobile ? "Xe" : "Xe buýt"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="routes"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <Route className="w-4 h-4" />
                {isMobile ? "Tuyến" : "Tuyến đường"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="tracking"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {isMobile ? "GPS" : "Theo dõi GPS"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="messages"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {isMobile ? "T.nhắn" : "Tin nhắn"}
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="password"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[50px] text-xs" : "gap-2"
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
      <main className={`${isMobile ? "p-2" : "p-4"} overflow-hidden`}>
        <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsContent value="dashboard" className="mt-0">
              <ManagerDashboard />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="schedules" className="mt-0">
              <ManagerSchedules />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="students" className="mt-0">
              <ManagerStudents />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="drivers" className="mt-0">
              <ManagerDrivers />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="vehicles" className="mt-0">
              <ManagerVehicles />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="routes" className="mt-0">
              <ManagerRoutes />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="tracking" className="mt-0">
              <ManagerTracking />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="messages" className="mt-0">
              <ManagerMessages />
            </AnimatedTabsContent>

            <AnimatedTabsContent value="password" className="mt-0">
              <ChangePassword userRole={Cookies.get("user_role")} />
            </AnimatedTabsContent>
          </AnimatedTabs>
        </div>
      </main>
    </div>
  );
}
