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
import { useNotificationHelpers } from "./useNotificationHelpers";
import { userLogin } from "../service/loginChange";
import {
  Bus,
  User,
  Users,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Cookie,
} from "lucide-react";

export function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { system, showError } = useNotificationHelpers();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      showError(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ tài khoản và mật khẩu!"
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await userLogin({ username, password });
      console.log(res.data.DT);

      if (res && res.data.EC === 0) {
        const account = res.data.DT.user;
        const access_token = res.data.DT.token;

        Cookies.set("access_token", access_token, {
          expires: 1 / 24,
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        });

        Cookies.set("user_id", account.id, {
          expires: 1 / 24,
        });

        const roleNames = {
          driver: "Tài xế",
          manager: "Quản lý",
          parent: "Phụ huynh",
        };
        system.login(roleNames[account.role]);
        onLogin(account.role);
      } else {
        showError(
          "Đăng nhập thất bại",
          res?.data?.EM || "Sai tài khoản hoặc mật khẩu"
        );
        setError(res?.data?.EM || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      console.error(err);
      showError(
        "Lỗi kết nối",
        "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 backdrop-blur-sm rounded-2xl mb-4 shadow-lg border border-blue-200">
            <Bus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2 drop-shadow-sm">
            SmartBus 1.0
          </h1>
          <p className="text-blue-700">Hệ thống quản lý xe buýt thông minh</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Tài khoản</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-700 drop-shadow-sm">
          <p>SmartBus 1.0</p>
          <p className="text-blue-600">Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
