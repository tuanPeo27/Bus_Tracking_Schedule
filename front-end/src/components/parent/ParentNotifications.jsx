import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIsMobile } from "../ui/use-mobile";
import { Bell, Bus, AlertTriangle, Clock, Info, X } from "lucide-react";

export function ParentNotifications({
  parentId,
  notificationsList,
  setNotificationsList,
}) {
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");

  // Đánh dấu đã đọc
  const handleMarkAsRead = (id) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Xóa từng thông báo
  const handleDeleteNotification = (id) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
  };

  // Xóa tất cả
  const handleDeleteAll = () => {
    setNotificationsList([]);
  };

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  const filteredNotifications = notificationsList.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

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
