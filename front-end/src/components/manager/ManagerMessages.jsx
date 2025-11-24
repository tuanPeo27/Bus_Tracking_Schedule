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
import { useIsMobile } from "../ui/use-mobile";
export default function ManagerMessages({ adminId,
  notificationsList,
  setNotificationsList, }) {
  const { showSuccess, showError, showInfo } = useNotificationHelpers();
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [specificRecipient, setSpecificRecipient] = useState("");
  const [recipientCategory, setRecipientCategory] = useState("driver"); // "driver" | "parent"
  const [messageType, setMessageType] = useState("info");
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [driversList, setDriversList] = useState([]);
  const [parentsList, setParentsList] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, dRes] = await Promise.all([getAllParent(), getAllDriver()]);
        const parents = (pRes?.data?.DT) || (pRes?.data) || [];
        const drivers = (dRes?.data?.DT) || (dRes?.data) || [];
        console.log("Lấy danh sách parents/drivers:", { parents, drivers });
        if (!mounted) return;
        setParentsList(Array.isArray(parents) ? parents : []);
        setDriversList(Array.isArray(drivers) ? drivers : []);
      } catch (err) {
        console.warn("Không lấy được danh sách parents/drivers:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);


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
          emitWithAck({ target: specificRecipient, ...payload }, "Đã gửi cho tài xế");
        } else {
          emitWithAck({ target: specificRecipient, ...payload }, "Đã gửi cho phụ huynh");
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




  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes} phút trước`;
    return `${hours} giờ trước`;
  };


  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${adminId}`);
    if (stored) {
      try {
        setNotificationsList(JSON.parse(stored));
      } catch {
        console.error("Lỗi parse JSON notifications");
      }
    }
  }, [adminId, setNotificationsList]);

  /** Mỗi khi danh sách thay đổi → lưu vào localStorage */
  useEffect(() => {
    localStorage.setItem(
      `notifications_${adminId}`,
      JSON.stringify(notificationsList)
    );
  }, [notificationsList, adminId]);


  const filteredNotifications = notificationsList.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
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
          <div className="grid md:grid-cols-1 gap-4">
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
          <CardTitle>Thông báo gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Alerts and Notifications */}
          <div className={`space-y-${isMobile ? "3" : "4"}`}>
            {filteredNotifications.map((n) => (
              <Card
                key={n.id}
                className={`transition-colors duration-200 ${!n.isRead ? "bg-blue-50" : "bg-white"
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
        </CardContent>
      </Card>

      {/* Message Statistics */}

    </div>
  );
}
