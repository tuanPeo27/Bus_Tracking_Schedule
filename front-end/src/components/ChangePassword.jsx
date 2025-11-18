import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useIsMobile } from "./ui/use-mobile";
import { userChangePassword } from "../service/loginChange";
import { useNotificationHelpers } from "./useNotificationHelpers";

export function ChangePassword({ username, userRole }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const { showSuccess, showError } = useNotificationHelpers();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return showError("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (newPassword !== confirmPassword) {
      return showError("Mật khẩu mới và xác nhận không khớp");
    }

    if (newPassword === currentPassword) {
      return showError("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    setIsLoading(true);
    try {
      const id = Cookies.get("user_id");
      const response = await userChangePassword({
        id,
        prePassword: currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        showSuccess("Đổi mật khẩu thành công");
        Cookies.remove("access_token");
        Cookies.remove("user_role");
        window.location.reload();

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        "Không thể đổi mật khẩu. Vui lòng kiểm tra lại.";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "driver":
        return "text-green-600";
      case "admin":
        return "text-blue-600";
      case "parent":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex items-center gap-3">
        <KeyRound
          className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} ${getRoleColor()}`}
        />
        <div>
          <h2 className={isMobile ? "text-lg" : "text-2xl"}>Đổi mật khẩu</h2>
          <p
            className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"
              }`}
          >
            Thay đổi mật khẩu đăng nhập của bạn
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin mật khẩu</CardTitle>
          <CardDescription>
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div>
              <Label>Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div>
              <Label>Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={`${userRole === "driver"
                  ? "bg-green-600 hover:bg-green-700"
                  : userRole === "admin"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-purple-600 hover:bg-purple-700"
                  }`}
              >
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
