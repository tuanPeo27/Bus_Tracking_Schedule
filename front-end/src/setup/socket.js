import { io } from "socket.io-client";

const socket = io("http://26.58.101.232:5000", {
    transports: ["websocket", "polling"]
});


export default socket;