const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { Op } = require("sequelize");
const User = require("./models/user");
const Student = require("./models/student");
const BusLocation = require("./models/busLocation");
const Schedule = require("./models/schedule");
const Bus = require("./models/bus");

const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const driverRoutes = require("./routes/driverRoutes");
const studentRoutes = require("./routes/studentRoutes");
const routeRoutes = require("./routes/routeRoutes");
const parentRoutes = require("./routes/parentRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const busStopRoutes = require("./routes/busStopRoutes");
const adminRoutes = require("./routes/adminRoutes");

const bodyParser = require("body-parser");
const BusStop = require("./models/busStop");

const app = express();

app.use(cors("*"));
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
app.use("/api/admin", adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  // console.log("From page:", socket.handshake.query.page);

  socket.on("bus-location", async (data) => {
    try {
      const { busId, latitude, longitude } = data;

      // console.log(data);
      if (!busId || !latitude || !longitude) {
        console.error("Dữ liệu vị trí xe buýt không hợp lệ:", data);
        return;
      }

      const bus = await Bus.findByPk(busId);
      if (!bus) {
        console.error(`Bus ${busId} không tồn tại`);
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
    } catch (error) {
      console.error("Lỗi xử lý vị trí xe buýt:", error);
    }
  });

  socket.on("student-pickup", async (data) => {
    try {
      const { stopId, pickup } = data;

      if (!stopId || !Array.isArray(pickup)) {
        console.error("Dữ liệu pickup không hợp lệ:", data);
        return;
      }

      const stop = await BusStop.findByPk(stopId);
      if (!stop) {
        console.error("Không tìm thấy điểm đón:", stopId);
        return;
      }

      for (const student of pickup) {
        const parent = await User.findByPk(student.parent_id);
        if (!parent) {
          console.error("Không tìm thấy phụ huynh cho học sinh:", student.id);
          continue;
        }

        const message = `Học sinh ${student.name} đã lên xe tại điểm ${stop.name}.`;

        console.log(
          `Gửi thông báo đến phụ huynh (${parent.username}): ${message}`
        );

        io.emit(`parent-notify-${parent.id}`, {
          message,
          studentId: student.id,
        });
      }
    } catch (error) {
      console.error("Lỗi xử lý học sinh lên xe:", error);
    }
  });

  socket.on("student-dropoff", async (data) => {
    try {
      const { stopId, dropoff } = data;

      if (!stopId || !Array.isArray(dropoff)) {
        console.error("Dữ liệu drop-off không hợp lệ:", data);
        return;
      }

      const stop = await BusStop.findByPk(stopId);
      if (!stop) {
        console.error("Không tìm thấy điểm trả:", stopId);
        return;
      }

      for (const student of dropoff) {
        const parent = await User.findByPk(student.parent_id);
        if (!parent) {
          console.error("Không tìm thấy phụ huynh cho học sinh:", student.id);
          continue;
        }

        const message = `Học sinh ${student.name} đã được trả tại điểm ${
          stop.name
        } vào lúc ${new Date().toLocaleTimeString()}.`;

        console.log(
          `Gửi thông báo đến phụ huynh (${parent.username}): ${message}`
        );

        io.emit(`parent-notify-${parent.id}`, {
          message,
          studentId: student.id,
        });
      }
    } catch (error) {
      console.error("Lỗi xử lý trả học sinh:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("SchoolBus backend is running!"));

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
