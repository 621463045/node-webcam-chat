/*This is a Node.js server-side script that uses
 the Express and Socket.io libraries to create a real-time 
 WebRTC video chat application. */


 /**
 * These lines import the Express and uuid libraries, 
 * and create an instance of the Express application and an HTTP server.
 */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid"); // สร้าง uuidv4 เพื่อสุ่ม Host 

/**
 * This line imports the ExpressPeerServer module from the peer library, 
 * and the next line creates an options object with the debug property 
 * set to true.
 */
const { ExpressPeerServer } = require("peer"); // ดึงตัวเเปร peer เพื่อเรียกใช้ server เพื่อเช็ต error ของโค๊ตโดยใช้ตัวเเปร debug
const opinions = {
    debug: true,
}

/**
 * This line sets the view engine for the Express application to EJS, 
 * and the next line imports the Socket.io library 
 * and attaches it to the HTTP server. 
 * The cors property is used to allow connections from any origin.
 */
app.set("view engine", "ejs"); // ตั้งค่า view engine เป้น ejs เพื่อมเชื่อกับ http เพื่อใช้ในการเชื่อมต่อต้นทาง
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

/**
 * These lines mount the ExpressPeerServer middleware on the /peerjs route 
 * and serve the contents of the public directory as static assets.
 */

app.use("/peerjs", ExpressPeerServer(server, opinions));    
app.use(express.static("public"));


/**
 * This code creates a route for the root URL and 
 * redirects the user to a randomly generated room ID 
 * created by uuidv4()
 */

app.get("/", (req, res) => {  // สร้าง route เพื่อสุ่มไอดีห้องโดยใช้ uuidv4
    res.redirect(`/${uuidv4()}`);
});


/**
 * This code creates a route for URLs with a room parameter 
 * and renders the room.ejs view with the roomId parameter passed in.
 */

app.get("/:room", (req, res) => { // สร้าง route ชื่อ room เเละเเสดงโดย room.ejs ด้วย paramitor roomid ที่ส่งเข้ามา
    res.render("room", { roomId: req.params.room });
});



/**
 * This code listens for a "connection" event from the client, 
 * and when a client connects it listens for a "join-room" event 
 * and joins the room with a certain roomId. 
 * It also emits an event "user-connected" with a certain userId 
 * after 1 sec. It also listens for a "message" event, 
 * and when a message is received, 
 * it emits the message and the userName to all clients in the room.
 */
io.on("connection", (socket) => { //เชื่อม client roomid โดยการใช้ roomId, userId เเละ userName รับข้อความเเละชื้่อ 1วินาทีเพื่อส่งไปให้คนในห้องทั้งหมด
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        setTimeout(() => {
            socket.to(roomId).broadcast.emit("user-connected", userId);
        }, 1000)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

/**This line starts the server and 
 * listens on the port specified in the 
 * PORT environment variable or port 3030 if it is not set. */
server.listen(process.env.PORT || 3030); // รับข้อมูลจาก port 3030 เพื่อใช้งาน

