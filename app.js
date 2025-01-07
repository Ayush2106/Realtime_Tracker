const express = require("express")
const app= express();
const http = require('http')
const path = require("path");

const socketio = require("socket.io");
const server = http.createServer(app)

const io = socketio(server);

io.on("connection", function (socket) {
    console.log("User connected:", socket.id);

    // Receive and broadcast location updates
    socket.on("send-location", function (data) {
        console.log("Location received on server:", data); // Log data received on the server
        io.emit("receive-location", { id: socket.id, ...data });
    });
    

    // Handle disconnection
    socket.on("disconnect", function () {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnected", socket.id);
    });
});


app.get("/" , (req,res) =>{
res.render("index")
})

// is used to setup ejs to write static files(images, css, html part)
app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname, "public")))

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is listening at port no: ${PORT}`);
});