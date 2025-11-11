import instance from "../setup/axios";

const fetchNotifications = async (userRole) => {
    return instance.get(`/api/notifications`, {
        params: { role: userRole },
    });
}

export { fetchNotifications };