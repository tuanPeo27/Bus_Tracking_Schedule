const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { Op } = require("sequelize");
const User = require("./models/user");
const Student = require("./models/student");
const BusLocation = require("./models/busLocation");
const Schedule = require("./models/schedule");

const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const driverRoutes = require("./routes/driverRoutes");
const studentRoutes = require("./routes/studentRoutes");
const routeRoutes = require("./routes/routeRoutes");
const parentRoutes = require("./routes/parentRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const busStopRoutes = require("./routes/busStopRoutes");

const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/busstops", busStopRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("incident-report", async (data) => {
    try {
      console.log("Incident report received:", data);
      const { busId, driverId, message } = data;
      if (!busId || !driverId || !message) {
        console.error("Dữ liệu báo cáo sự cố không hợp lệ:", data);
        return;
      }

      const driver = await User.findOne({
        where: { id: driverId, role: "driver" },
      });
      if (!driver) {
        console.error("Tài xế không tồn tại:", driverId);
        socket.emit("incident-response", {
          EC: -1,
          EM: "Tài xế không tồn tại.",
        });
        return;
      }

      io.emit("admin-incident-alert", {
        busId,
        driverId,
        message,
        time: new Date(),
      });

      socket.emit("incident-response", {
        EC: 0,
        EM: "Đã gửi sự cố thành công!",
      });
    } catch (error) {
      console.error("Lỗi xử lý báo cáo sự cố:", error);
      socket.emit("incident-response", {
        EC: -1,
        EM: "Lỗi server khi gửi sự cố.",
      });
    }
  });

  socket.on("bus-location", async (data) => {
    try {
      console.log("Bus location received:", data);
      const { busId, latitude, longitude } = data;

      if (!busId || !latitude || !longitude) {
        console.error("Dữ liệu vị trí xe buýt không hợp lệ:", data);
        return;
      }

      const newLocation = await BusLocation.create({
        bus_id: busId,
        latitude,
        longitude,
      });

      io.emit("bus-location-update", {
        busId,
        latitude,
        longitude,
        timestamp: newLocation.timestamp,
      });

      const now = new Date();
      const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

      const schedule = await Schedule.findOne({
        where: {
          busId,
          date: today,
          status: { [Op.ne]: "completed" },
        },
      });

      const arrival = new Date(`${today}T${schedule.arrival_time}`);
      const arrivalDelay = (now - arrival) / (1000 * 60);

      if (arrivalDelay > 10 && schedule.status === "in_progress") {
        console.log(`Xe ${busId} đến muộn ${Math.round(arrivalDelay)} phút`);

        const message = `Xe buýt số ${busId} đến muộn ${Math.round(
          arrivalDelay
        )} phút so với kế hoạch.`;

        io.emit("admin-alert", { busId, message, time: now });
        io.emit("parent-notify-all", { message, time: now });
      }
    } catch (error) {
      console.error("Lỗi xử lý vị trí xe buýt:", error);
    }
  });

  socket.on("student-dropoff", async (data) => {
    try {
      console.log("Student drop-off received:", data);
      const { studentId } = data;
      if (!studentId) {
        console.error("Dữ liệu trả học sinh không hợp lệ:", data);
        return;
      }

      const student = await Student.findByPk(studentId);
      if (!student) {
        console.error("Học sinh không tồn tại:", studentId);
        return;
      }

      const parent = await User.findByPk(student.parent_id);
      if (!parent) {
        console.error("Phụ huynh không tồn tại cho học sinh:", studentId);
        return;
      }

      const message = `Học sinh ${student.name} đã được trả tại điểm ${
        student.dropoff_point
      } an toan vào lúc ${new Date().toLocaleTimeString()}.`;

      console.log(
        `Gửi thông báo đến phụ huynh (${parent.username}): ${message}`
      );

      io.emit(`parent-notify-${parent.id}`, {
        message,
        studentId,
      });
    } catch (error) {
      console.error("Lỗi xử lý trả học sinh:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("SchoolBus backend is running!"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
