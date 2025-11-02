import instance from "../setup/axios";

const userLogin = async (data) => {
    return instance.post(`/user/login`, data);
}

const userChangePassword = async (data) => {
    return instance.post(`user/changepassword`, data)
}
export { userLogin, userChangePassword };