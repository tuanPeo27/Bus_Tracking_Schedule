import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, School, Bus } from "lucide-react";

export function ParentDashboard({ parentInfo, studentInfo, routeInfo }) {
  const parent = parentInfo;

  const students = React.useMemo(() => {
    return Array.isArray(studentInfo)
      ? studentInfo
      : studentInfo
      ? [studentInfo]
      : [];
  }, [studentInfo]);
  const routes = React.useMemo(() => {
    return Array.isArray(routeInfo) ? routeInfo : routeInfo ? [routeInfo] : [];
  }, [routeInfo]);
  return (
    <div className="space-y-6">
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
              <h3 className="font-medium">
                Username: {parent?.username || "—"}
              </h3>
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

      {/* Con em + tuyến đường tương ứng */}
      {students.length > 0 ? (
        students.map((student) => {
          const route = routes.find((r) => r.studentId === student.id);

          return (
            <div key={student.id} className="grid md:grid-cols-2 gap-6">
              {/* Card Con em */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="w-5 h-5" />
                    Thông tin Con em
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries({
                      "Mã học sinh": student.id,
                      Tên: student.name,
                      Lớp: student.class || "12C1",
                      Trường: student.school,
                      "Điểm đi": student.pickup_point.name,
                      "Điểm đến": student.dropoff_point.name,
                    }).map(([label, value]) => (
                      <div
                        className="flex items-center justify-between"
                        key={label}
                      >
                        <span className="font-medium">{label}:</span>
                        <span>{value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card Tuyến đường */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="w-5 h-5" />
                    Tuyến đường của {student.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {route ? (
                    <div className="space-y-3">
                      {Object.entries({
                        "Mã học sinh": route.studentId,
                        "Điểm bắt đầu": route.route.start_point,
                        "Điểm kết thúc": route.route.end_point,
                        "Tuyến xe": route.route.name,
                      }).map(([label, value]) => (
                        <div
                          className="flex items-center justify-between"
                          key={label}
                        >
                          <span className="font-medium">{label}:</span>
                          <span>{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Không có tuyến đường cho học sinh này
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })
      ) : (
        <p className="text-muted-foreground">Chưa có thông tin học sinh</p>
      )}
    </div>
  );
}
