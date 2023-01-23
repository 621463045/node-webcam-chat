const socket = io("/");
const videoGrid = document.getElementById("video-grid");  //คำสั่งสำหรับการเข้าถึง Element Id ที่ต้องการใน Form HTML
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

backBtn.addEventListener("click", () => { // กำหนดปุ่ม css จากหน้า room.ejs
  document.querySelector(".main__left").style.display = "flex"; 
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {    // กำหนดปุ่ม css จากหน้า room.ejs                                           
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");   // โค๊ตให้กรอกชื่อของเรา ตอนที่เข้าเ localhost:3030

var peer = new Peer({   // สร้าง ตัวเเปร var เก็บข้อมูล  host port path 
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [     // สร้าง iceServers ใช้ server stun ในการเชื่อมต่อ
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credentials: 'openrelayproject'
      }
      // {
      //   url: 'turn:192.158.29.39:3478?transport=tcp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // }
    ]
  },

  debug: 3
});

let myVideoStream;       // โค๊ตกดอนุญาติ กล้องวิดีโอ
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {        // โค๊ตส่วนของ Webcam เเละ steam หน้าจอ
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => { 
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {                         // เมื่อ กรอกชื่อเสร็จ จะทำการ ่join โดยการใช้ตัวเเปร peer ในการเชื่อม server จาก id 
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {       // เมื่อ
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");  // โค๊ต chat 
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => { // เมื่อกดปุ่ม click mouse จะทำการส่ง MNessage
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {    // เมื่อกดปุ่ม Enter จะส่งข้อความ Message
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton"); // โค๊ตส่วนในการกรอก Username เพื่อเข้ไปใน Webcam
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {                                                    //เมื่อกดปุ่มไมค์จะเป็นสีเเดง ก็คือ ปิดไมค์
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;           //เมื่อกดปุ่มไมค์อีกรอบจะเป็นสีน้ำเงิน
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {   // โค๊ตปุ่ม video 
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;    //เมื่อกดปุ่มไมค์จะเป็นสีเเดง ก็คือ ปิดกล้อง
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true; //เมื่อกดปุ่มไมค์อีกรอบจะเป็นสีน้ำเงิน
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {         // โค๊ต Copy Location 
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {     // โค๊ตสร้างข้อความที่เราพิมพ์ลงไปใน ช่อง button
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});