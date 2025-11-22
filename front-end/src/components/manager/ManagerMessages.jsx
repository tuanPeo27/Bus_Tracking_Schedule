import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  MessageSquare,
  Send,
  Users,
  User,
  Bell,
  AlertTriangle,
} from "lucide-react";
import socket from "../../setup/socket";

export default function ManagerMessages() {
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [specificRecipient, setSpecificRecipient] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [message, setMessage] = useState("");

  const drivers = [
    { id: "TX001", name: "Nguyễn Văn Minh" },
    { id: "TX002", name: "Trần Văn Hùng" },
    { id: "TX003", name: "Lê Thị Lan" },
    { id: "TX004", name: "Phạm Văn Đức" },
  ];

  const recentMessages = [
    {
      id: 1,
      recipient: "Tất cả tài xế",
      recipientType: "drivers",
      type: "urgent",
      content: "Thay đổi lịch trình khẩn cấp cho ngày mai do thời tiết xấu.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "sent",
    },
    {
      id: 2,
      recipient: "Nguyễn Văn Minh",
      recipientType: "driver",
      type: "info",
      content: "Anh vui lòng kiểm tra áp suất lốp xe trước khi bắt đầu ca.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "delivered",
    },
    {
      id: 3,
      recipient: "Phụ huynh Tuyến 1",
      recipientType: "parents",
      type: "reminder",
      content:
        "Xe buýt sẽ đến điểm đón trong 10 phút. Vui lòng chuẩn bị sẵn sàng.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "delivered",
    },
  ];

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRecipient) return;

    const payload = {
      title:
        messageType === "urgent"
          ? "Thông báo khẩn"
          : messageType === "reminder"
            ? "Lời nhắc"
            : "Thông báo",
      content: message,
      type: messageType,
      from: "manager",
      timestamp: new Date().toISOString(),
    };

    try {
      // Emit depending on recipient
      if (selectedRecipient === "all_parents") {
        socket.emit(
          "manager-send-notification",
          { target: "all_parents", ...payload },
          (ack) => {
            if (ack?.ok) alert("Đã gửi cho tất cả phụ huynh");
          }
        );
      } else if (selectedRecipient === "all_drivers") {
        socket.emit(
          "manager-send-notification",
          { target: "all_drivers", ...payload },
          (ack) => {
            if (ack?.ok) alert("Đã gửi cho tất cả tài xế");
          }
        );
      } else if (selectedRecipient === "specific") {
        // Try to detect driver id first (from dropdown), otherwise treat as parent id
        if (drivers.find((d) => d.id === specificRecipient)) {
          socket.emit(
            "manager-send-notification",
            { target: "driver", driverId: specificRecipient, ...payload },
            (ack) => {
              if (ack?.ok) alert("Đã gửi cho tài xế");
            }
          );
        } else {
          socket.emit(
            "manager-send-notification",
            { target: "parent", parentId: specificRecipient, ...payload },
            (ack) => {
              if (ack?.ok) alert("Đã gửi cho phụ huynh");
            }
          );
        }
      }

      console.log("Sent payload:", {
        recipient: selectedRecipient,
        specificRecipient,
        ...payload,
      });
    } catch (err) {
      console.error("Socket send error", err);
      alert("Gửi thất bại, thử lại sau.");
    }

    // Clear form
    setMessage("");
    setSelectedRecipient("");
    setSpecificRecipient("");
    setMessageType("info");

    // keep existing confirmation minimal (socket callbacks above also notify)
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "reminder":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getRecipientIcon = (type) => {
    switch (type) {
      case "drivers":
        return <Users className="w-4 h-4 text-green-600" />;
      case "parents":
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes} phút trước`;
    return `${hours} giờ trước`;
  };

  return (
    <div className="space-y-6">
      {/* Send Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Gửi tin nhắn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Người nhận</Label>
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người nhận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_drivers">Tất cả tài xế</SelectItem>
                  <SelectItem value="all_parents">Tất cả phụ huynh</SelectItem>
                  <SelectItem value="specific">Người cụ thể</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRecipient === "specific" && (
              <div>
                <Label>Chọn người cụ thể</Label>
                <Select
                  value={specificRecipient}
                  onValueChange={setSpecificRecipient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế hoặc phụ huynh" />
                  </SelectTrigger>
                  <SelectContent>
                    <optgroup label="Tài xế">
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </optgroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Loại tin nhắn</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Thông tin thường</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  <SelectItem value="reminder">Nhắc nhở</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Nội dung tin nhắn</Label>
            <Textarea
              placeholder="Nhập nội dung tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !selectedRecipient}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi tin nhắn
            </Button>

            <Button variant="outline">Lưu nháp</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Mẫu tin nhắn nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() =>
                setMessage(
                  "Xe buýt sẽ đến điểm đón trong 10 phút. Vui lòng chuẩn bị sẵn sàng."
                )
              }
            >
              <div>
                <p className="font-medium">Thông báo đến điểm</p>
                <p className="text-sm text-muted-foreground">
                  Gửi cho phụ huynh
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() =>
                setMessage(
                  "Vui lòng kiểm tra tình trạng xe và báo cáo trước khi bắt đầu ca làm việc."
                )
              }
            >
              <div>
                <p className="font-medium">Kiểm tra xe</p>
                <p className="text-sm text-muted-foreground">Gửi cho tài xế</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() =>
                setMessage(
                  "Do thời tiết xấu, lịch trình có thể bị thay đổi. Chúng tôi sẽ thông báo cập nhật sớm nhất."
                )
              }
            >
              <div>
                <p className="font-medium">Thay đổi lịch trình</p>
                <p className="text-sm text-muted-foreground">Thông báo chung</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Tin nhắn gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRecipientIcon(msg.recipientType)}
                    <div>
                      <p className="font-medium">{msg.recipient}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getMessageTypeColor(
                            msg.type
                          )}`}
                        >
                          {msg.type === "urgent"
                            ? "Khẩn cấp"
                            : msg.type === "reminder"
                              ? "Nhắc nhở"
                              : "Thông tin"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {msg.status === "sent" && (
                      <span className="text-xs text-blue-600">Đã gửi</span>
                    )}
                    {msg.status === "delivered" && (
                      <span className="text-xs text-green-600">Đã nhận</span>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tin nhắn hôm nay
                </p>
                <p className="font-semibold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã đọc</p>
                <p className="font-semibold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tin khẩn cấp</p>
                <p className="font-semibold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
