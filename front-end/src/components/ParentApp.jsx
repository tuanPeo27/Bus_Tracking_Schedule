import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useNotificationHelpers } from "./useNotificationHelpers";
import { useNotifications } from "./NotificationContext";
import { useIsMobile } from "./ui/use-mobile";
import socket from "../setup/socket";
import {
  Bus,
  Bell,
  LogOut,
  LayoutDashboard,
  MapPin,
  KeyRound,
} from "lucide-react";
import { ParentDashboard } from "./parent/ParentDashboard";
import { ParentTracking } from "./parent/ParentTracking";
import { ParentNotifications } from "./parent/ParentNotifications";
import { ChangePassword } from "./ChangePassword";
import {
  getInfoParent,
  getInfoStudent,
  getRouteByStudentId,
} from "../service/parentService";

export function ParentApp({ onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { system } = useNotificationHelpers();
  const { clearAll } = useNotifications();
  const isMobile = useIsMobile();

  const [parentInfo, setParentInfo] = useState("");
  const [studentInfo, setStudentInfo] = useState("");
  const [routeInfo, setRouteInfo] = useState("");

  // --- STATE NOTIFICATIONS (sửa chuẩn theo yêu cầu) ---
  const [notificationsList, setNotificationsList] = useState([]);

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  // --- LOGOUT ---
  const handleLogout = () => {
    clearAll();
    system.logout();
    onBack();
  };

  // --- GET PARENT INFO ---
  const getParent = async () => {
    try {
      const res = await getInfoParent(Cookies.get("user_id"));
      if (res && res.data.EC === 0) {
        setParentInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phụ huynh:", error);
    }
  };

  const getStudent = async () => {
    try {
      const res = await getInfoStudent(Cookies.get("user_id"));
      if (res && res.data.EC === 0) {
        setStudentInfo(res.data.DT);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin học sinh:", error);
    }
  };

  useEffect(() => {
    getParent();
    getStudent();
  }, []);

  // --- GET ROUTES ---
  useEffect(() => {
    if (studentInfo && studentInfo.length > 0) {
      const fetchAllRoutes = async () => {
        try {
          const allRoutes = await Promise.all(
            studentInfo.map(async (student) => {
              const res = await getRouteByStudentId(student.id);
              if (res && res.data.EC === 0) {
                return { studentId: student.id, route: res.data.DT };
              }
              return { studentId: student.id, route: [] };
            })
          );
          setRouteInfo(allRoutes);
        } catch (error) {
          console.log("Lỗi khi lấy tuyến đường:", error);
        }
      };

      fetchAllRoutes();
    }
  }, [studentInfo]);

  // --- LOAD NOTIFICATIONS LOCALSTORAGE KHI parentInfo.id CÓ GIÁ TRỊ ---
  useEffect(() => {
    if (!parentInfo?.id) return;

    const saved = localStorage.getItem(`notifications_${parentInfo.id}`);
    setNotificationsList(saved ? JSON.parse(saved) : []);
  }, [parentInfo?.id]);

  // --- SOCKET LISTENER ---
  useEffect(() => {
    if (!parentInfo?.id) return;

    const handleNotification = (notification) => {
      const newNotification = {
        id: Date.now(),
        title: notification?.title || "Thông báo mới",
        content:
          typeof notification === "string"
            ? notification
            : notification?.message || "Không có nội dung",
        timestamp: new Date(),
        isRead: false,
        type: notification?.type || "info",
      };

      // Lưu
      setNotificationsList((prev) => {
        const updated = [newNotification, ...prev];
        localStorage.setItem(
          `notifications_${parentInfo.id}`,
          JSON.stringify(updated)
        );
        return updated;
      });

      // Toast
      switch (newNotification.type) {
        case "success":
        case "arrival":
          system.success(newNotification.title, newNotification.content);
          break;
        case "warning":
        case "schedule_change":
          system.warning(newNotification.title, newNotification.content);
          break;
        case "error":
        case "delay":
          system.error(newNotification.title, newNotification.content);
          break;
        default:
          system.info(newNotification.title, newNotification.content);
      }
    };

    socket.on(`parent-notify-${parentInfo.id}`, handleNotification);

    return () => {
      socket.off(`parent-notify-${parentInfo.id}`, handleNotification);
    };
  }, [parentInfo?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className={`${isMobile ? "text-base" : "text-lg"}`}>
                  {isMobile ? "Phụ huynh" : "Giao diện Phụ huynh"}
                </h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Theo dõi hành trình con em
                  </p>
                )}
              </div>
            </div>

            {/* Avatar + logout */}
            <div className="flex items-center gap-2 md:gap-4">
              <Avatar className={isMobile ? "w-8 h-8" : ""}>
                <AvatarFallback
                  className={`bg-purple-600 text-white ${
                    isMobile ? "text-sm" : ""
                  }`}
                >
                  Par
                </AvatarFallback>
              </Avatar>

              {!isMobile && (
                <div className="text-right">
                  <p className="font-medium">{parentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {studentInfo.length ?? 0} con em
                  </p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className={`${
                isMobile ? "h-16 w-full justify-start" : "h-12"
              } bg-transparent border-0 ${isMobile ? "overflow-x-auto" : ""}`}
            >
              <TabsTrigger
                value="dashboard"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {isMobile ? "Tổng" : "Tổng quan"}
              </TabsTrigger>

              <TabsTrigger
                value="tracking"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {isMobile ? "GPS" : "Theo dõi xe buýt"}
              </TabsTrigger>

              <TabsTrigger
                value="notifications"
                className={`relative ${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
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
              </TabsTrigger>

              <TabsTrigger
                value="password"
                className={`${
                  isMobile ? "flex-col gap-1 min-w-[60px] text-xs" : "gap-2"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {isMobile ? "Đổi MK" : "Đổi mật khẩu"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className={isMobile ? "p-2" : "p-4"}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0">
            <ParentDashboard
              parentInfo={parentInfo}
              studentInfo={studentInfo}
              routeInfo={routeInfo}
            />
          </TabsContent>

          <TabsContent value="tracking" className="mt-0">
            <ParentTracking studentInfo={studentInfo} routeInfo={routeInfo} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <ParentNotifications
              parentId={parentInfo.id}
              notificationsList={notificationsList}
              setNotificationsList={setNotificationsList}
            />
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <ChangePassword userRole={Cookies.get("user_role")} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
