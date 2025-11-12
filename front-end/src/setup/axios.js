import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
    baseURL: 'http://26.58.101.232:5000/api',
    // withCredentials: true,
});


instance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access_token");
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const status = error.response?.status || 500;
    switch (status) {
        case 400: {
            // toast.error('');
            return Promise.reject(error);
        }
        case 401: {
            // toast.error('Unauthorized the user. Please login!!');

            return Promise.reject(error);
        }
        default: {
            // toast.error('')
            return Promise.reject(error);
        }
    }
});

export default instance;