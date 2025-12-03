import instance from "../setup/axios";
import axios from "axios";

const getInfoDriver = async (id) => {
  return instance.get(`drivers/${id}`);
};

const getInfoVehicle = async (id) => {
  return instance.get(`buses/driver/${id}`);
};

const getDriverSchedule = async (id) => {
  return instance.get(`schedules/driver/${id}`);
};

const getSchedulesByDriverId = async (id) => {
  return instance.get(`schedules/driver/${id}`);
};

const getStudentsByScheduleId = async (id) => {
  return instance.get(`students/schedule/${id}`);
};

const getDriverGPS = async (id) => {
  return instance.get(`busstops/route/${id}`);
};

const getBusStopsByRouteId = async (route_id) => {
  return instance.get(`/busstops/route/${route_id}`);
};

const getScheduleByStudentId = async (student_id) => {
  return instance.get(`/schedules/student/${student_id}`);
};

const editStatusBusStop = async (busStopId, status) => {
  return instance.put(`/busstops/status/${busStopId}`, { status });
};

const editAllStatus = async (route_id, status) => {
  return instance.put(`/busstops/status/all/${route_id}`, { status });
};

export {
  getInfoDriver,
  getInfoVehicle,
  getDriverSchedule,
  getSchedulesByDriverId,
  getStudentsByScheduleId,
  getDriverGPS,
  getBusStopsByRouteId,
  editStatusBusStop,
  editAllStatus,
  getScheduleByStudentId,
};
