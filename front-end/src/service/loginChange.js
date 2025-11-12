import instance from "../setup/axios";

const userLogin = async (data) => {
    return instance.post(`/user/login`, data);
}

const userChangePassword = async (data) => {
    console.log(data);
    return instance.post(`user/forgotpass`, data)
}
export { userLogin, userChangePassword };