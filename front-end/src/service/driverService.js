import instance from "../setup/axios";
import axios from "axios";

const getInfoDriver = async (id) => {
    return instance.get(`drivers/${id}`);
}

const getInfoVehicle = async (id) => {
    return instance.get(`buses/driver/${id}`);
}

const getDriverSchedule = async (id) => {
    return instance.get(`schedules/driver/${id}`);
}

const getSchedulesByDriverId = async (id) => {
    return instance.get(`schedules/driver/${id}`);
}

const getStudentsByScheduleId = async (id) => {
    return instance.get(`students/schedule/${id}`);
}

const getDriverGPS = async (id) => {
    return instance.get(`busstops/route/${id}`);
}



const getBusStopsByRouteId = async (route_id) => {
  return instance.get(`/busstops/route/${route_id}`);
};


export {
  getInfoDriver,
  getInfoVehicle,
  getDriverSchedule,
  getSchedulesByDriverId,
  getStudentsByScheduleId,
  getDriverGPS,
  getBusStopsByRouteId,
};