import React, { useState, useEffect } from "react";
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
import { useNotificationHelpers } from "../useNotificationHelpers";
import { getAllParent, getAllDriver } from "../../service/adminService";

export default function ManagerMessages() {
  const { showSuccess, showError, showInfo } = useNotificationHelpers();
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [specificRecipient, setSpecificRecipient] = useState("");
  const [recipientCategory, setRecipientCategory] = useState("driver"); // "driver" | "parent"
  const [messageType, setMessageType] = useState("info");
  const [message, setMessage] = useState("");

  const [driversList, setDriversList] = useState([]);
  const [parentsList, setParentsList] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, dRes] = await Promise.all([getAllParent(), getAllDriver()]);
        const parents = (pRes?.data?.DT) || (pRes?.data) || [];
        const drivers = (dRes?.data?.DT) || (dRes?.data) || [];
        if (!mounted) return;
        setParentsList(Array.isArray(parents) ? parents : []);
        setDriversList(Array.isArray(drivers) ? drivers : []);
      } catch (err) {
        console.warn("Không lấy được danh sách parents/drivers:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
    if (selectedRecipient === "specific" && !specificRecipient) return;
    if (!socket || !socket.connected) {
      showError("Lỗi", "Socket chưa kết nối, thử lại sau.");
      return;
    }

    const payload = {
      title:
        messageType === "urgent"
          ? "Thông báo khẩn"
          : messageType === "reminder"
            ? "Lời nhắc"
            : "Thông báo",
      // ParentApp expects `message` (preferred) — giữ cả hai để tương thích
      message: message,
      content: message,
      type: messageType,
      from: "manager",
      timestamp: new Date().toISOString(),
    };

    try {
      console.log("Prepare send notification", { selectedRecipient, recipientCategory, specificRecipient, payload });
      showInfo("Đang gửi", "Tin nhắn đang được gửi lên server...");

      // helper để emit với ack + fallback timeout
      const emitWithAck = (eventPayload, successMsg) => {
        let acked = false;
        socket.emit("manager-send-notification", eventPayload, (ack) => {
          acked = true;
          if (ack?.ok) showSuccess("Thành công", successMsg);
          else showError("Lỗi", ack?.message || "Server trả về lỗi");
        });
        setTimeout(() => {
          if (!acked) {
            showError("Lỗi", "Không nhận phản hồi từ server sau 5s. Kiểm tra kết nối hoặc server.");
            console.warn("No ack from server for payload", eventPayload);
          }
        }, 5000);
      };

      if (selectedRecipient === "all_parents") {
        // chính: gửi cho server xử lý broadcast
        emitWithAck({ target: "all_parents", ...payload }, "Đã gửi cho tất cả phụ huynh");
        // fallback: emit trực tiếp event parent-notify-<id> cho từng parent (nếu server chuyển tiếp các event này)
        if (Array.isArray(parentsList) && parentsList.length > 0) {
          parentsList.forEach((p) => {
            try {
              socket.emit(`parent-notify-${p.id}`, payload);
            } catch (e) {
              // noop
            }
          });
        }
      } else if (selectedRecipient === "all_drivers") {
        emitWithAck({ target: "all_drivers", ...payload }, "Đã gửi cho tất cả tài xế");
      } else if (selectedRecipient === "specific") {
        if (recipientCategory === "driver") {
          emitWithAck({ target: "driver", driverId: specificRecipient, ...payload }, "Đã gửi cho tài xế");
        } else {
          emitWithAck({ target: "parent", parentId: specificRecipient, ...payload }, "Đã gửi cho phụ huynh");
          // fallback emit trực tiếp event parent-notify-<id> để tăng xác suất nhận (server có thể chuyển tiếp)
          try {
            socket.emit(`parent-notify-${specificRecipient}`, payload);
          } catch (e) { /* noop */ }
        }
      }

      console.log("Emit done (optimistic)", { selectedRecipient, specificRecipient, payload });
    } catch (err) {
      console.error("Socket send error", err);
      showError("Lỗi", err?.message || "Gửi thất bại, thử lại sau.");
    }

    // Clear form
    setMessage("");
    setSelectedRecipient("");
    setSpecificRecipient("");
    setRecipientCategory("driver");
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
              <>
                <div>
                  <Label>Loại người nhận</Label>
                  <Select value={recipientCategory} onValueChange={(v) => { setRecipientCategory(v); setSpecificRecipient(""); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">Tài xế</SelectItem>
                      <SelectItem value="parent">Phụ huynh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Chọn người cụ thể ({recipientCategory === "driver" ? "Tài xế" : "Phụ huynh"})</Label>
                  <Select value={specificRecipient} onValueChange={setSpecificRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Chọn ${recipientCategory === "driver" ? "tài xế" : "phụ huynh"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(recipientCategory === "driver" ? driversList : parentsList).length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground">Không có dữ liệu</div>
                      )}
                      {(recipientCategory === "driver" ? driversList : parentsList).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name || item.username || item.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
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
              disabled={!message.trim() || !selectedRecipient || (selectedRecipient === "specific" && !specificRecipient)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi tin nhắn
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Quick Message Templates */}

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

    </div>
  );
}
