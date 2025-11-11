import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "./ui/use-mobile";
import { userChangePassword } from "../service/loginChange";

export function ChangePassword({ username, userRole }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (newPassword !== confirmPassword) {
      return setError("Mật khẩu mới và xác nhận không khớp");
    }

    if (newPassword === currentPassword) {
      return setError("Mật khẩu mới phải khác mật khẩu hiện tại");
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
        toast.success("Đổi mật khẩu thành công");
        setSuccess(true);

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
      setError(message);
      toast.error("Lỗi", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "driver":
        return "text-green-600";
      case "manager":
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
            className={`text-muted-foreground ${
              isMobile ? "text-xs" : "text-sm"
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Mật khẩu đã được thay đổi thành công!
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
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
                  required
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
                  required
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
                  setError("");
                  setSuccess(false);
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={`${
                  userRole === "driver"
                    ? "bg-green-600 hover:bg-green-700"
                    : userRole === "manager"
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
