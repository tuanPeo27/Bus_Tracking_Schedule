import React, { useEffect, useRef } from "react";
import { useNotificationHelpers } from "./useNotificationHelpers";
import { fetchNotifications } from "../service/notifications";

export function NotificationDemo({ userRole, loginKey }) {
  const { system, showInfo, showWarning } = useNotificationHelpers();
  const executedRef = useRef("");

  useEffect(() => {
    // Chỉ chạy lại nếu loginKey thay đổi
    if (executedRef.current === loginKey) return;
    executedRef.current = loginKey;

    // const fetchNotifications = async () => {
    //   try {
    //     const response = await fetchNotifications(userRole);

    //     const data = response.data.DT;

    //     if (Array.isArray(data)) {
    //       data.forEach((n) => {
    //         // hiển thị thông báo tùy loại
    //         if (n.type === "warning") {
    //           showWarning(n.title, n.message, n.duration || 4000);
    //         } else {
    //           showInfo(n.title, n.message, n.duration || 4000);
    //         }
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Lỗi khi tải thông báo:", error);
    //     system.error && system.error("Không thể tải thông báo mới.");
    //   }
    // };

    // fetchNotifications();
  }, [loginKey, userRole, system, showInfo, showWarning]);

  return null; // Không hiển thị giao diện, chỉ xử lý logic
}
