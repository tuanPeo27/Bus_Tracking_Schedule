import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
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

export default function DriverNotifications({ driverId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [notifications, setNotifications] = useState([
    {
      id: "NTF001",
      type: "urgent",
      title: "Thay đổi lịch trình khẩn cấp",
      content:
        "Lịch trình ngày mai (20/12) đã được thay đổi. Thời gian bắt đầu từ 06:30 thay vì 07:00. Vui lòng xác nhận đã nhận được thông báo.",
      sender: "Phòng Điều Hành",
      senderType: "admin",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      requiresAction: true,
    },
    {
      id: "NTF002",
      type: "message",
      title: "Tin nhắn từ phụ huynh",
      content:
        "Chào anh tài xế, con em tôi (Nguyễn Minh Anh - lớp 10A1) hôm nay sẽ không đi học. Xin cảm ơn anh!",
      sender: "Bà Nguyễn Thị Lan",
      senderType: "parent",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      requiresAction: false,
    },
    {
      id: "NTF003",
      type: "info",
      title: "Thông báo bảo dưỡng xe",
      content:
        "Xe 29A-12345 đã đến hạn bảo dưỡng định kỳ. Vui lòng đưa xe đến garage vào cuối tuần này.",
      sender: "Phòng Kỹ Thuật",
      senderType: "admin",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      requiresAction: false,
    },
    {
      id: "NTF004",
      type: "warning",
      title: "Cảnh báo thời tiết",
      content:
        "Dự báo có mưa lớn vào chiều nay. Anh vui lòng lái xe chậm và cẩn thận, ưu tiên an toàn.",
      sender: "Hệ thống tự động",
      senderType: "system",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: true,
      requiresAction: false,
    },
    {
      id: "NTF005",
      type: "message",
      title: "Yêu cầu thay đổi điểm đón",
      content:
        "Xin chào anh, do tình況 đặc biệt, ngày mai em muốn thay đổi điểm đón từ Ngã tư Hàng Xanh sang Chợ Bến Thành. Anh có thể hỗ trợ được không?",
      sender: "Anh Trần Văn Hoàng",
      senderType: "parent",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isRead: true,
      requiresAction: true,
    },
  ]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleConfirmAction = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, isRead: true, requiresAction: false }
          : n
      )
    );
    console.log(`Confirmed action: ${notificationId}`);
  };

  const handleRejectAction = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, isRead: true, requiresAction: false }
          : n
      )
    );
    console.log(`Rejected action: ${notificationId}`);
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "info":
        return <Info className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSenderAvatar = (senderType, sender) => {
    const initials = sender
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);
    const bgColor =
      senderType === "admin"
        ? "bg-blue-500"
        : senderType === "parent"
          ? "bg-green-500"
          : "bg-gray-500";

    return (
      <Avatar className="w-8 h-8">
        <AvatarFallback className={`${bgColor} text-white`}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const filteredNotifications = notifications.filter((notification) => {
    const match =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sender.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "unread") return match && !notification.isRead;
    if (filter === "important")
      return (
        match && (notification.type === "urgent" || notification.requiresAction)
      );
    return match;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Thông báo
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} mới</Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Chưa đọc ({unreadCount})
              </Button>
              <Button
                variant={filter === "important" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("important")}
              >
                Quan trọng
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Đọc tất cả
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${!notification.isRead
              ? "border-l-4 border-blue-500 bg-blue-50/50"
              : ""
              }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {getNotificationIcon(notification.type)}

                <div className="flex-1 space-y-2">
                  {/* Title + Time */}
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {notification.content}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-between items-center">
                    {/* Sender */}
                    <div className="flex gap-2 items-center">
                      {getSenderAvatar(
                        notification.senderType,
                        notification.sender
                      )}
                      <div className="text-sm leading-tight">
                        <p className="font-medium">{notification.sender}</p>
                        <p className="text-muted-foreground text-xs">
                          {notification.senderType === "admin"
                            ? "Quản lý"
                            : notification.senderType === "parent"
                              ? "Phụ huynh"
                              : "Hệ thống"}
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1">
                      {notification.requiresAction && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmAction(notification.id)}
                          >
                            <Check className="w-3 h-3 mr-1" /> Xác nhận
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectAction(notification.id)}
                          >
                            <X className="w-3 h-3 mr-1" /> Từ chối
                          </Button>
                        </>
                      )}

                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p>Không có thông báo phù hợp</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
