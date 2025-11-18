import { useNotifications } from './NotificationContext';

export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const showSuccess = (title, message, duration) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  const showError = (title, message, duration) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 7000 // Error messages stay longer
    });
  };

  const showWarning = (title, message, duration) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 6000
    });
  };

  const showInfo = (title, message, duration) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  // Predefined system notifications
  const systemNotifications = {
    login: (userType) => showSuccess(
      'Đăng nhập thành công!',
      `Chào mừng bạn trở lại với vai trò ${userType}.`,
      4000
    ),
    
    logout: () => showInfo(
      'Đã đăng xuất',
      'Cảm ơn bạn đã sử dụng SmartBus 1.0.',
      3000
    ),
    
    dataUpdated: (item) => showSuccess(
      'Cập nhật thành công!',
      `${item} đã được cập nhật thành công.`,
      3000
    ),
    
    dataDeleted: (item) => showSuccess(
      'Xóa thành công!',
      `${item} đã được xóa khỏi hệ thống.`,
      3000
    ),
    
    dataCreated: (item) => showSuccess(
      'Tạo mới thành công!',
      `${item} đã được thêm vào hệ thống.`,
      3000
    ),
    
    connectionLost: () => showError(
      'Mất kết nối',
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      0 // Don't auto-dismiss
    ),
    
    connectionRestored: () => showSuccess(
      'Đã khôi phục kết nối',
      'Kết nối đến máy chủ đã được khôi phục.',
      4000
    ),
    
    locationUpdated: () => showInfo(
      'Vị trí đã cập nhật',
      'GPS đã cập nhật vị trí hiện tại của xe.',
      2000
    ),

    studentCheckIn: (studentName) => showSuccess(
      'Học sinh lên xe',
      `${studentName} đã lên xe thành công.`,
      3000
    ),

    studentCheckOut: (studentName) => showInfo(
      'Học sinh xuống xe',
      `${studentName} đã xuống xe an toàn.`,
      3000
    ),

    emergencyAlert: (message) => showError(
      'Cảnh báo khẩn cấp!',
      message,
      0 // Don't auto-dismiss emergency alerts
    ),

    scheduleReminder: (time, route) => showWarning(
      'Nhắc nhở lịch trình',
      `Chuyến xe ${route} sẽ bắt đầu lúc ${time}.`,
      8000
    ),

    maintenanceReminder: (vehicle, dueDate) => showWarning(
      'Nhắc nhở bảo trì',
      `Xe ${vehicle} cần bảo trì vào ngày ${dueDate}.`,
      10000
    )
  };

  const locationError = (message) => showError(
    'Lỗi GPS',
    `Không thể lấy vị trí: ${message}. Vui lòng kiểm tra quyền truy cập vị trí và tín hiệu GPS.`,
    7000
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    system: systemNotifications,
    locationError,
  };
}
