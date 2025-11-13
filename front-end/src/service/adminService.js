import instance from "../setup/axios";


const getInfoAdmin = async (idUser) => {
    return instance.get(`admin/${idUser}`);
}

const getInfoRoute = async (idRoute) => {
    return instance.get(`routes/${idRoute}`);
}

const getInfoBus = async (idBus) => {
    return instance.get(`buses/${idBus}`)
}

const getInfoStudentByRouteId = async (idRoute) => {
    return instance.get(`students/route/${idRoute}`);
}

const getInfoDriver = async (idUser) => {
    return instance.get(`drivers/${idUser}`);
}

const getAllDriver = async () => {
    return instance.get(`drivers/`);
}

const getAllBus = async () => {
    return instance.get(`buses/`);
}

const getAllRoute = async () => {
    return instance.get(`routes/`);
}

const getAllStudent = async () => {
    return instance.get(`students`);
}

const getAllSchedule = async () => {
    return instance.get(`schedules`);
}

const updateSchedule = async (data, idSchedule) => {
    return instance.put(`schedules/edit/${idSchedule}`, data)
}

const createSchedule = async (data) => {
    return instance.post(`schedules/create`, data);
}

const deleteSchedule = async (idSchedule) => {
    return instance.delete(`schedules/delete/${idSchedule}`);
}


export { getInfoAdmin, getAllDriver, getAllBus, getAllRoute, getAllStudent, getAllSchedule, getInfoRoute, getInfoBus, getInfoStudentByRouteId, getInfoDriver, createSchedule, updateSchedule, deleteSchedule };
