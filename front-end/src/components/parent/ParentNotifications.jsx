import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIsMobile } from "../ui/use-mobile";
import {
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Bus,
  MapPin,
  X,
} from "lucide-react";

export function ParentNotifications({ parentId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const isMobile = useIsMobile();

  const [notificationsList, setNotificationsList] = useState([
    {
      id: "N001",
      type: "arrival",
      title: "Xe buýt đang đến gần",
      content:
        "Xe 29A-12345 sẽ đến điểm đón trong 5 phút. Vui lòng chuẩn bị cho con em.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      priority: "high",
      actionRequired: false,
    },
    {
      id: "N002",
      type: "delay",
      title: "Xe buýt bị trễ",
      content:
        "Do tình trạng giao thông, xe 29A-12345 sẽ trễ khoảng 10 phút. Ước tính đến điểm đón lúc 07:25.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      priority: "high",
      actionRequired: false,
    },
    {
      id: "N003",
      type: "pickup",
      title: "Con em đã lên xe",
      content:
        "Nguyễn Minh Anh đã lên xe buýt lúc 07:15. Xe đang di chuyển đến trường.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      priority: "normal",
      actionRequired: false,
    },
    {
      id: "N004",
      type: "schedule_change",
      title: "Thay đổi lịch trình",
      content:
        "Lịch trình ngày mai (20/12) có thay đổi nhỏ. Thời gian đón sẽ sớm hơn 15 phút do điều chỉnh tuyến đường.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: "normal",
      actionRequired: true,
    },
    {
      id: "N005",
      type: "reminder",
      title: "Nhắc nhở chuẩn bị",
      content:
        "Ngày mai là thứ Hai, xe buýt sẽ đón con em lúc 07:00. Vui lòng chuẩn bị sẵn sàng.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isRead: true,
      priority: "low",
      actionRequired: false,
    },
  ]);

  const handleMarkAsRead = (notificationId) => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "arrival":
        return <Bus className="w-5 h-5 text-blue-500" />;
      case "delay":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "pickup":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "schedule_change":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "reminder":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Quan trọng</Badge>;
      case "normal":
        return (
          <Badge className="bg-blue-100 text-blue-800">Thông thường</Badge>
        );
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Thấp</Badge>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const filteredNotifications = notificationsList.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "unread") return matchesSearch && !notification.isRead;
    if (filter === "important")
      return (
        matchesSearch &&
        (notification.priority === "high" || notification.actionRequired)
      );
    return matchesSearch;
  });

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;
  const importantCount = notificationsList.filter(
    (n) => n.priority === "high" || n.actionRequired
  ).length;

  return (
    <div className={`space-y-${isMobile ? "4" : "6"}`}>
      {/* Header */}
      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle
            className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}
          >
            <Bell className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            Thông báo
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} mới</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-0" : ""}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isMobile ? "text-sm" : ""}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={isMobile ? "text-xs" : ""}
              >
                Tất cả
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={isMobile ? "text-xs" : ""}
              >
                Chưa đọc ({unreadCount})
              </Button>
              <Button
                variant={filter === "important" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("important")}
                className={isMobile ? "text-xs" : ""}
              >
                Quan trọng ({importantCount})
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className={`text-blue-600 ${isMobile ? "text-xs" : ""}`}
                >
                  <CheckCircle
                    className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`}
                  />
                  Đọc tất cả
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className={`space-y-${isMobile ? "3" : "4"}`}>
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${
              !notification.isRead
                ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                : ""
            } ${notification.priority === "high" ? "border-red-200" : ""}`}
          >
            <CardContent className={isMobile ? "p-3" : "p-4"}>
              <div className={`flex items-start gap-${isMobile ? "3" : "4"}`}>
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4
                          className={`font-medium ${isMobile ? "text-sm" : ""}`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Cần xử lý
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm text-muted-foreground leading-relaxed ${
                          isMobile ? "text-xs" : ""
                        }`}
                      >
                        {notification.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isMobile && getPriorityBadge(notification.priority)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(notification.timestamp)}
                      {isMobile && (
                        <span className="ml-2">
                          {getPriorityBadge(notification.priority)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {notification.actionRequired && (
                        <Button
                          size="sm"
                          className={`h-7 px-3 ${isMobile ? "text-xs" : ""}`}
                        >
                          Xem chi tiết
                        </Button>
                      )}

                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-3 ${isMobile ? "text-xs" : ""}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle
                            className={`${
                              isMobile ? "w-3 h-3" : "w-4 h-4"
                            } mr-1`}
                          />
                          {!isMobile && "Đánh dấu đã đọc"}
                          {isMobile && "Đã đọc"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className={`${isMobile ? "p-6" : "p-8"} text-center`}>
              <Bell
                className={`${
                  isMobile ? "w-10 h-10" : "w-12 h-12"
                } mx-auto mb-4 text-muted-foreground`}
              />
              <h3 className={`font-medium mb-2 ${isMobile ? "text-sm" : ""}`}>
                Không có thông báo
              </h3>
              <p
                className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}
              >
                {filter === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo."
                  : filter === "important"
                  ? "Không có thông báo quan trọng nào."
                  : "Không tìm thấy thông báo phù hợp."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>
            Cài đặt thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-0" : ""}>
          <div className={`space-y-${isMobile ? "3" : "4"}`}>
            <div
              className={`flex items-center justify-between ${
                isMobile ? "py-2" : "py-2"
              }`}
            >
              <div className="flex-1 pr-4">
                <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                  Thông báo khi xe đến gần
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  Nhận thông báo 5 phút trước khi xe đến
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div
              className={`flex items-center justify-between ${
                isMobile ? "py-2" : "py-2"
              }`}
            >
              <div className="flex-1 pr-4">
                <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                  Cảnh báo khi xe bị trễ
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  Thông báo ngay khi xe trễ hơn 10 phút
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div
              className={`flex items-center justify-between ${
                isMobile ? "py-2" : "py-2"
              }`}
            >
              <div className="flex-1 pr-4">
                <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                  Xác nhận đón/trả
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  Thông báo khi con em lên/xuống xe
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div
              className={`flex items-center justify-between ${
                isMobile ? "py-2" : "py-2"
              }`}
            >
              <div className="flex-1 pr-4">
                <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                  Thay đổi lịch trình
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  Thông báo khi có thay đổi lịch trình
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div
              className={`flex items-center justify-between ${
                isMobile ? "py-2" : "py-2"
              }`}
            >
              <div className="flex-1 pr-4">
                <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                  Nhắc nhở hàng ngày
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  Nhắc nhở chuẩn bị trước giờ đón
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
