import instance from "../setup/axios";

const getInfoParent = async (idUser) => {
    return instance.get(`parents/${idUser}`);
};

const getInfoStudent = async (idUser) => {
    return instance.get(`students/parent/${idUser}`);
};

const getRouteByStudentId = async (idStudent) => {
    return instance.get(`routes/student/${idStudent}`);
};
const getStudentCurrentLocation = async (studentId) => {
    return instance.get();
};

export { getInfoParent, getInfoStudent, getRouteByStudentId, getStudentCurrentLocation };
