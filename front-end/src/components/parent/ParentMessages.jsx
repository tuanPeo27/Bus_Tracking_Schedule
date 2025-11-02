import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
import { useIsMobile } from "../ui/use-mobile";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";

export function ParentMessages({ parentId }) {
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [messageType, setMessageType] = useState("question");
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();

  const messageHistory = [
    {
      id: 1,
      recipient: "Nguyễn Văn Minh (Tài xế)",
      type: "request",
      content:
        "Xin chào anh tài xế, ngày mai con em tôi sẽ không đi học do ốm. Xin cảm ơn anh!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "read",
      response: "Dạ, tôi đã ghi nhận. Chúc em sớm khỏe lại ạ.",
    },
    {
      id: 2,
      recipient: "Phòng Điều hành",
      type: "question",
      content:
        "Cho tôi hỏi lịch trình xe buýt có thay đổi gì trong tuần tới không ạ?",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "read",
      response:
        "Chào chị, lịch trình tuần tới vẫn giữ nguyên như thường lệ. Nếu có thay đổi, chúng tôi sẽ thông báo trước.",
    },
    {
      id: 3,
      recipient: "Nguyễn Văn Minh (Tài xế)",
      type: "report",
      content:
        "Anh ơi, hôm qua xe đến trễ khoảng 15 phút so với lịch trình. Có thể cho biết lý do không ạ?",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "read",
      response:
        "Xin lỗi chị, hôm qua do tắc đường bất ngờ trên đường Nguyễn Văn Cừ nên xe bị trễ. Tôi sẽ cố gắng đi sớm hơn để tránh tình trạng này.",
    },
  ];

  const recipients = [
    { id: "driver_1", name: "Nguyễn Văn Minh (Tài xế)", type: "driver" },
    { id: "management", name: "Phòng Điều hành", type: "management" },
  ];

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRecipient) return;

    // Simulate sending message
    console.log("Sending message:", {
      recipient: selectedRecipient,
      type: messageType,
      content: message,
    });

    // Clear form
    setMessage("");
    setSelectedRecipient("");
    setMessageType("question");

    alert("Tin nhắn đã được gửi thành công!");
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case "report":
        return "text-red-600 bg-red-50";
      case "request":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "sent":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Send Message Form */}
      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            <span className={isMobile ? "text-base" : ""}>Gửi tin nhắn</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? "p-4" : ""}`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isMobile ? "text-sm" : ""}>Người nhận</Label>
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
              >
                <SelectTrigger className={isMobile ? "text-sm" : ""}>
                  <SelectValue placeholder="Chọn người nhận" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isMobile ? "text-sm" : ""}>Loại tin nhắn</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger className={isMobile ? "text-sm" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">Câu hỏi</SelectItem>
                  <SelectItem value="request">Yêu cầu</SelectItem>
                  <SelectItem value="report">Báo cáo/Phản hồi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={isMobile ? "text-sm" : ""}>
              Nội dung tin nhắn
            </Label>
            <Textarea
              placeholder="Nhập nội dung tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={isMobile ? 3 : 4}
              className={isMobile ? "text-sm" : ""}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !selectedRecipient}
            className={`bg-purple-600 hover:bg-purple-700 ${
              isMobile ? "w-full" : ""
            }`}
            size={isMobile ? "sm" : "default"}
          >
            <Send className="w-4 h-4 mr-2" />
            Gửi tin nhắn
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>
            Lịch sử tin nhắn
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4" : ""}>
          <div className={isMobile ? "space-y-4" : "space-y-6"}>
            {messageHistory.map((msg) => (
              <div
                key={msg.id}
                className={`border rounded-lg ${isMobile ? "p-3" : "p-4"}`}
              >
                <div
                  className={`flex ${
                    isMobile ? "flex-col gap-2" : "items-start justify-between"
                  } mb-3`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={isMobile ? "w-8 h-8" : "w-10 h-10"}>
                      <AvatarFallback className={isMobile ? "text-xs" : ""}>
                        {msg.recipient.includes("Tài xế") ? "TX" : "QL"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                        {msg.recipient}
                      </p>
                      <div
                        className={`flex ${
                          isMobile ? "flex-col gap-1" : "items-center gap-2"
                        } mt-1`}
                      >
                        <span
                          className={`text-xs px-2 py-1 rounded ${getMessageTypeColor(
                            msg.type
                          )}`}
                        >
                          {msg.type === "question"
                            ? "Câu hỏi"
                            : msg.type === "request"
                            ? "Yêu cầu"
                            : "Báo cáo"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      isMobile ? "ml-11" : ""
                    }`}
                  >
                    {getStatusIcon(msg.status)}
                    <span className="text-xs text-muted-foreground">
                      {msg.status === "read" ? "Đã đọc" : "Đã gửi"}
                    </span>
                  </div>
                </div>

                <div className={isMobile ? "space-y-2" : "space-y-3"}>
                  <div
                    className={`bg-blue-50 rounded-lg ${
                      isMobile ? "p-2.5" : "p-3"
                    }`}
                  >
                    <p
                      className={`leading-relaxed ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>

                  {msg.response && (
                    <div
                      className={`bg-gray-50 rounded-lg ${
                        isMobile ? "p-2.5" : "p-3"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Phản hồi:
                      </p>
                      <p
                        className={`leading-relaxed ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}
                      >
                        {msg.response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>
            Thông tin liên hệ
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-4" : ""}>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`bg-gray-50 rounded-lg ${isMobile ? "p-3" : "p-4"}`}
            >
              <h4 className={`font-medium mb-2 ${isMobile ? "text-sm" : ""}`}>
                Tài xế
              </h4>
              <p className={isMobile ? "text-xs mb-1" : "text-sm mb-1"}>
                Nguyễn Văn Minh
              </p>
              <p
                className={`text-muted-foreground mb-2 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Xe 29A-12345 - Tuyến 1
              </p>
              <div className="flex items-center gap-2">
                <Phone className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                <a
                  href="tel:0912345678"
                  className={`text-blue-600 hover:underline ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  0912-345-678
                </a>
              </div>
            </div>

            <div
              className={`bg-gray-50 rounded-lg ${isMobile ? "p-3" : "p-4"}`}
            >
              <h4 className={`font-medium mb-2 ${isMobile ? "text-sm" : ""}`}>
                Phòng Điều hành
              </h4>
              <p className={isMobile ? "text-xs mb-1" : "text-sm mb-1"}>
                Trung tâm Quản lý Xe buýt
              </p>
              <p
                className={`text-muted-foreground mb-2 ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Hỗ trợ 24/7
              </p>
              <div className="flex items-center gap-2">
                <Phone className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                <a
                  href="tel:02812345678"
                  className={`text-blue-600 hover:underline ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  028-1234-5678
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
