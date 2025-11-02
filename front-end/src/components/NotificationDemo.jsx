import React, { useEffect, useRef } from 'react';
import { useNotificationHelpers } from './useNotificationHelpers';

export function NotificationDemo({ userRole, loginKey }) {
  const { system, showInfo, showWarning } = useNotificationHelpers();
  const executedRef = useRef('');

  useEffect(() => {
    // Chỉ chạy demo nếu loginKey khác với lần trước
    if (executedRef.current === loginKey) return;
    executedRef.current = loginKey;

    // Demo notifications based on user role
    const setupNotifications = () => {
      switch (userRole) {
        case 'driver':
          // Driver-specific notifications
          setTimeout(() => {
            system.scheduleReminder('07:30', 'Tuyến 1: Bến xe Miền Đông - Trường THPT Nguyễn Du');
          }, 2000);
          
          setTimeout(() => {
            system.studentCheckIn('Nguyễn Văn An');
          }, 5000);

          setTimeout(() => {
            system.locationUpdated();
          }, 8000);
          break;

        case 'manager':
          // Manager-specific notifications
          setTimeout(() => {
            showInfo(
              'Hệ thống hoạt động bình thường', 
              'Tất cả xe buýt đang vận hành theo lịch trình.',
              4000
            );
          }, 3000);

          setTimeout(() => {
            system.maintenanceReminder('29A-12345', '25/12/2024');
          }, 6000);
          
          setTimeout(() => {
            showWarning(
              'Cảnh báo thời tiết',
              'Dự báo có mưa to vào chiều nay. Khuyến cáo lái xe cẩn thận.',
              8000
            );
          }, 9000);
          break;

        case 'parent':
          // Parent-specific notifications
          setTimeout(() => {
            showInfo(
              'Con bạn đã lên xe',
              'Nguyễn Minh An đã lên xe buýt lúc 07:15. Dự kiến đến trường lúc 07:45.',
              6000
            );
          }, 3000);

          setTimeout(() => {
            showInfo(
              'Cập nhật vị trí',
              'Xe buýt hiện đang ở Đường Lê Văn Việt, dự kiến 10 phút nữa đến trường.',
              5000
            );
          }, 7000);
          break;
      }
    };

    setupNotifications();
  }, [loginKey, userRole, system, showInfo, showWarning]);

  return null; // This component doesn't render anything
}