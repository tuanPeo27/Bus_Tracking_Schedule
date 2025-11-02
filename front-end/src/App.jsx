import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { DriverApp } from "./components/DriverApp";
import { ManagerApp } from "./components/ManagerApp";
import { ParentApp } from "./components/ParentApp";
import { LoginForm } from "./components/LoginForm";
import { Toaster } from "./components/ui/sonner";
import { NotificationProvider } from "./components/NotificationContext";
import { NotificationPanel } from "./components/NotificationPanel";
import { NotificationDemo } from "./components/NotificationDemo";

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [loginKey, setLoginKey] = useState("");

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const savedRole = Cookies.get("user_role");
      if (savedRole) setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    setLoginKey(Date.now().toString());
    Cookies.set("user_role", role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoginKey("");
    Cookies.remove("access_token");
    Cookies.remove("user_role");
    window.location.reload();
  };

  return (
    <NotificationProvider>
      {userRole === "driver" && (
        <>
          <DriverApp onBack={handleLogout} />
          <NotificationDemo userRole="driver" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {userRole === "manager" && (
        <>
          <ManagerApp onBack={handleLogout} />
          <NotificationDemo userRole="manager" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {userRole === "parent" && (
        <>
          <ParentApp onBack={handleLogout} />
          <NotificationDemo userRole="parent" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {!userRole && (
        <>
          <LoginForm onLogin={handleLogin} />
          <NotificationPanel />
          <Toaster />
        </>
      )}
    </NotificationProvider>
  );
}
