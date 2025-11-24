import instance from "../setup/axios";


const getInfoAdmin = async (idUser) => {
    return instance.get(`admin/${idUser}`);
}

const getInfoParent = async (idUser) => {
    return instance.get(`parents/${idUser}`);
};

const getInfoRoute = async (idRoute) => {
    return instance.get(`routes/${idRoute}`);
}

const getInfoBus = async (idBus) => {
    return instance.get(`buses/${idBus}`)
}

const getInfoStudentByRouteId = async (idRoute) => {
    return instance.get(`students/route/${idRoute}`);
}

const getScheduleByDriverId = async (idDriver) => {
    return instance.get(`schedules/driver/${idDriver}`)
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
    return instance.get(`students/`);
}

const getAllSchedule = async () => {
    return instance.get(`schedules`);
}

const getAllParent = async () => {
    return instance.get(`parents/`)
}

const updateSchedule = async (data, idSchedule) => {
    return instance.put(`schedules/edit/${idSchedule}`, data)
}

const createSchedule = async (data) => {
    return instance.post(`schedules/create`, data);
}

const createRoute = async (data) => {
    return instance.post(`routes/create`, data);
}

const createBusStop = async (data) => {
    return instance.post(`busstops/create`, data);
}

const createStudent = async (data) => {
    return instance.post(`students/create`, data);
}

const createDriver = async (data) => {
    return instance.post(`drivers/create`, data);
}

const deleteSchedule = async (idSchedule) => {
    return instance.delete(`schedules/delete/${idSchedule}`);
}

const deleteStudent = async (idStudent) => {
    return instance.delete(`students/delete/${idStudent}`);
}

const updateStudent = async (data, idStudent) => {
    return instance.put(`students/edit/${idStudent}`, data)
}

const updateDriver = async (data, idDriver) => {
    return instance.put(`drivers/edit/${idDriver}`, data)
}

const updateBus = async (data, idBus) => {
    return instance.put(`buses/edit/${idBus}`, data)
}

const updateRoute = async (data, idRoute) => {
    return instance.put(`routes/edit/${idRoute}`, data)
}

const updateBusStop = async (data, idBusStop) => {
    return instance.put(`busstops/edit/${idBusStop}`, data)
}

const updateParent = async (data, idParent) => {
    return instance.put(`parents/edit/${idParent}`, data)
}

const deleteDriver = async (idDriver) => {
    return instance.delete(`drivers/delete/${idDriver}`);
}

const deleteBus = async (idBus) => {
    return instance.delete(`buses/delete/${idBus}`);
}

const createBus = async (data) => {
    return instance.post(`buses/create`, data);
}

const deleteParent = async (idParent) => {
    return instance.delete(`parents/delete/${idParent}`);
}

const deleteBusStop = async (idBusStop) => {
    return instance.delete(`busstops/delete/${idBusStop}`);
}

const createParent = async (data) => {
    return instance.post(`parents/create`, data);
}

const getBusStopByRouteId = async (idRoute) => {
    return instance.get(`busstops/route/${idRoute}`)
}

const deleteRoute = async (idRoute) => {
    return instance.delete(`routes/delete/${idRoute}`);
}



export {
    deleteRoute,
    updateRoute,
    updateBusStop,
    deleteBusStop,
    createBusStop,
    createRoute,
    getBusStopByRouteId,
    updateParent,
    createParent,
    deleteParent,
    deleteBus,
    updateBus,
    createBus,
    deleteDriver,
    updateDriver,
    createDriver,
    updateStudent,
    getScheduleByDriverId,
    getInfoAdmin,
    getAllDriver,
    getAllBus,
    getAllRoute,
    getAllStudent,
    getAllSchedule,
    getInfoRoute,
    getInfoBus,
    getInfoStudentByRouteId,
    getInfoDriver,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllParent,
    getInfoParent,
    deleteStudent,
    createStudent,

};
