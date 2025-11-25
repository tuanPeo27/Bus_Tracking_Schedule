import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIsMobile } from "../ui/use-mobile";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useNotificationHelpers } from "../useNotificationHelpers"; 
import { io } from "socket.io-client";
import {
  Bell,
  Search,
  MessageSquare,
  AlertTriangle,
  Info,
  Clock,
  Check,
  X,
  Trash2,
  CheckCircle,
} from "lucide-react";

export default function DriverNotifications({ 
  driverId,
  notificationsList,
  setNotificationsList,
}) {
  //khoi tao socket io
  const socket = io("http://26.58.101.232:5000", {
  transports: ["websocket", "polling"],
});

  const isMobile = useIsMobile();
  //State cho tu khoa tim kiem
  const [searchTerm, setSearchTerm] = useState("");
  //su dung hook thong bao
  const { emergencyAlert, showError } = useNotificationHelpers();

  //chay 1 lan khi component duoc mount hoạc driverId thay doi
  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${driverId}`);
    if (stored) {
      try {
        setNotificationsList(JSON.parse(stored));
      } catch {
        console.error("Lỗi parse JSON notifications");
      }
    }
  }, [driverId, setNotificationsList]);

  //luu thong bao vao localstorage khi co thay doi
  useEffect(() => {
    localStorage.setItem(
      `notifications_${driverId}`,
      JSON.stringify(notificationsList)
    );
  }, [notificationsList, driverId]);

  //danh dau 1 thong bao la da doc
  const handleMarkAsRead = (id) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  //danh dau tat ca thong bao la da doc
  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  //xoa 1 thong bao
  const handleDeleteNotification = (id) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
  };

  //xoa tat ca thong bao
  const handleDeleteAll = () => {
    setNotificationsList([]);
    localStorage.removeItem(`notifications_${driverId}`);
  };

  //gui tin hieu khan cap
  const handleWarning = () => {
    const message = "Tài xế báo cáo sự cố.";
    socket.emit(`driver-warning`, {driverId, message});
    if (typeof emergencyAlert === 'function') {
        emergencyAlert("Đã gửi tín hiệu khẩn cấp tới trung tâm điều hành!");
    } else {
        showError(
            "Lỗi",
            "Không thể gửi tín hiệu khẩn cấp. Vui lòng thử lại sau.",
            0
          );
    }
  };

  //dem so thong bao chua doc
  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  //loc thong bao theo tu khoa tim kiem
  const filteredNotifications = notificationsList.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  //chon icon theo loai thong bao
  const getNotificationIcon = (type) => {
    switch (type) {
      case "arrival":
        return <Bus className="w-5 h-5 text-blue-500" />;
      case "delay":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "schedule_change":
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  //format thoi gian thong bao
  const formatTimestamp = (timestamp) => {
    const time = new Date(timestamp);
    if (isNaN(time)) return "N/A";

    const now = new Date();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  //render giao dien
  return (
    <div className={`space-y-${isMobile ? "4" : "6"} max-w-xl mx-auto`}>
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="w-5 h-5 text-gray-700" />
            Thông báo
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                {unreadCount} mới
              </Badge>
            )}
          </CardTitle>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Đọc tất cả
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={notificationsList.length === 0}
            >
              Xóa tất cả
            </Button>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={handleWarning}
            >
              Báo cáo sự cố
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Input
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
        </CardContent>
      </Card>

      {/* Notification list */}
      <div className={`space-y-${isMobile ? "3" : "4"}`}>
        {filteredNotifications.map((n) => (
          <Card
            key={n.id}
            className={`transition-colors duration-200 ${
              !n.isRead ? "bg-blue-50" : "bg-white"
            } hover:bg-blue-100 shadow-sm`}
          >
            <CardContent className="flex justify-between items-start gap-3 p-4">
              <div className="flex gap-3 flex-1 items-start">
                {getNotificationIcon(n.type)}

                <div className="flex flex-col gap-1">
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.content}</p>
                  <p className="text-xs text-gray-400">
                    {formatTimestamp(n.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    Đã đọc
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteNotification(n.id)}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state */}
        {filteredNotifications.length === 0 && (
          <Card className="text-center py-8">
            <Bell className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Không có thông báo phù hợp</p>
          </Card>
        )}
      </div>
    </div>
  );
}
