import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useNotificationHelpers } from "../useNotificationHelpers";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Send,
} from "lucide-react";

export default function DriverStatus({ currentStatus, onStatusChange }) {
  const [incidentReport, setIncidentReport] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { showSuccess, showWarning, showInfo } = useNotificationHelpers();

  const statusOptions = [
    {
      value: "active",
      label: "Đang hoạt động",
      description: "Xe đang hoạt động bình thường, thực hiện lịch trình",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-green-100 text-green-800 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      value: "break",
      label: "Nghỉ giải lao",
      description: "Tạm dừng hoạt động để nghỉ ngơi, ăn uống",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      value: "incident",
      label: "Sự cố",
      description: "Xe gặp sự cố kỹ thuật, tai nạn hoặc tình huống bất thường",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "bg-red-100 text-red-800 border-red-200",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    {
      value: "offline",
      label: "Ngoại tuyến",
      description: "Kết thúc ca làm việc, xe không hoạt động",
      icon: <XCircle className="w-5 h-5" />,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  const handleStatusChange = (newStatus) => {
    const statusInfo = statusOptions.find(
      (option) => option.value === newStatus
    );
    onStatusChange(newStatus);

    // Hiển thị thông báo dựa trên loại trạng thái
    if (newStatus === "active") {
      showSuccess(
        "Trạng thái đã cập nhật",
        `Xe đã chuyển sang trạng thái: ${statusInfo?.label}`
      );
    } else if (newStatus === "incident") {
      showWarning(
        "Báo cáo sự cố",
        "Trạng thái sự cố đã được kích hoạt. Vui lòng liên hệ bộ phận hỗ trợ nếu cần thiết."
      );
    } else {
      showInfo(
        "Trạng thái đã thay đổi",
        `Xe đã chuyển sang trạng thái: ${statusInfo?.label}`
      );
    }
  };

  const handleSubmitIncidentReport = async () => {
    if (!incidentReport.trim()) return;

    setIsSubmittingReport(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmittingReport(false);
    setIncidentReport("");

    // Hiển thị thông báo thành công
    showSuccess(
      "Báo cáo đã gửi",
      "Báo cáo sự cố đã được gửi thành công! Bộ phận hỗ trợ sẽ liên hệ sớm nhất."
    );
  };

  const recentStatusChanges = [
    {
      status: "active",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      note: "Bắt đầu ca sáng",
    },
    {
      status: "break",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      note: "Nghỉ giải lao 15 phút",
    },
    {
      status: "active",
      timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      note: "Tiếp tục lịch trình",
    },
  ];

  const currentStatusInfo = statusOptions.find(
    (option) => option.value === currentStatus
  );

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Trạng thái hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg border-2 ${currentStatusInfo?.color}`}
          >
            <div className="flex items-center gap-3">
              {currentStatusInfo?.icon}
              <div>
                <h3 className="font-medium">{currentStatusInfo?.label}</h3>
                <p className="text-sm opacity-75">
                  {currentStatusInfo?.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Options */}
      <Card>
        <CardHeader>
          <CardTitle>Thay đổi trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentStatus === option.value
                    ? option.color
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {option.icon}
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>

                <Button
                  className={`w-full ${option.buttonColor}`}
                  disabled={currentStatus === option.value}
                  onClick={() => handleStatusChange(option.value)}
                >
                  {currentStatus === option.value
                    ? "Đang áp dụng"
                    : "Chuyển sang"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Báo cáo sự cố
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nếu gặp sự cố hoặc tình huống bất thường, vui lòng mô tả chi tiết để
            chúng tôi hỗ trợ kịp thời.
          </p>

          <Textarea
            placeholder="Mô tả chi tiết về sự cố (vị trí, thời gian, tình况, mức độ nghiêm trọng...)"
            value={incidentReport}
            onChange={(e) => setIncidentReport(e.target.value)}
            rows={4}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitIncidentReport}
              disabled={!incidentReport.trim() || isSubmittingReport}
              className="bg-red-600 hover:bg-red-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIncidentReport("");
                handleStatusChange("incident");
              }}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Báo sự cố khẩn cấp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentStatusChanges.map((change, index) => {
              const statusInfo = statusOptions.find(
                (opt) => opt.value === change.status
              );
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {statusInfo?.icon}
                  <div className="flex-1">
                    <p className="font-medium">{statusInfo?.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {change.note}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {change.timestamp.toLocaleString("vi-VN")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
