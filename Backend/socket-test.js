const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("bus-location", {
    busId: 1,
    latitude: 10.762622,
    longitude: 106.6601723,
  });
});

socket.on("bus-location-update", (data) => {
  console.log("Server broadcast:", data);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});
