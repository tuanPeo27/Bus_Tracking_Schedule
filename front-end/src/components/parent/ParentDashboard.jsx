import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, School, Phone, Bell } from "lucide-react";

export function ParentDashboard({ parentInfo, studentInfo }) {
  const parent = parentInfo;
  const students = React.useMemo(() => {
    return Array.isArray(studentInfo)
      ? studentInfo
      : studentInfo
      ? [studentInfo]
      : [];
  }, [studentInfo]);

  return (
    <div className="space-y-6">
      {/* Thông tin phụ huynh & con em */}
      <div className="grid md:grid-cols-1 gap-6">
        {/* Thông tin Phụ huynh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin Phụ huynh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-purple-600 text-white text-lg">
                  {parent?.avatar || "Par"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{parent?.username || "—"}</h3>
                <p className="text-sm text-muted-foreground">
                  Mã phụ huynh: {parent?.id || "—"}
                </p>
                <Badge variant="outline" className="mt-2">
                  {students.length + " con em"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin Con em */}
        {students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id || student.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  Thông tin Con em
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries({
                    Tên: student.name,
                    Lớp: student.class || "12C1",
                    Trường: student.school,
                    "Điểm đi": student.pickup_point,
                    "Điểm đến": student.dropoff_point,
                  }).map(([label, value], i) => (
                    <div className="flex items-center justify-between" key={i}>
                      <span className="font-medium">{label}:</span>
                      {label === "Tuyến xe" ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          {value || "—"}
                        </Badge>
                      ) : (
                        <span className={label === "Trường" ? "text-sm" : ""}>
                          {value || "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">Chưa có thông tin học sinh</p>
        )}
      </div>

      {/* Tác vụ nhanh */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium mb-1">Liên hệ tài xế</h4>
            <p className="text-sm text-muted-foreground">
              Gửi tin nhắn cho tài xế
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium mb-1">Cài đặt thông báo</h4>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh cảnh báo và nhắc nhở
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
