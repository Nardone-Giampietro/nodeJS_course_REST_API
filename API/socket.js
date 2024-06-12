const { Server } = require("socket.io");
let io;

exports.socketInit = function (server) {
        io = new Server(server, {
            cors: {
                origin: "http://localhost:3000",
            },
        });
        return io;
}

exports.getIo = function (server) {
    if (!io){
        throw new Error("Socket.io not initialized.");
    }
    return io;
}

