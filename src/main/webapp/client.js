var name;
var room; // you are connected to this room
var connection = new WebSocket('ws://localhost:5080/signalling/ws');

var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#username');
var loginButton = document.querySelector('#login');
var callPage = document.querySelector('#call-page');
var roomIdInput = document.querySelector('#room-id');
var connectButton = document.querySelector('#connect');
var createButton = document.querySelector('#create');
var hangUpButton = document.querySelector('#hang-up');
callPage.style.display = "none";

var configuration = {
  "iceservers" : [{ "url" : "stun:stun.1.google.com:19302" }]
};

var yourVideo = document.querySelector("#yours");
var theirVideo = document.querySelector("#theirs");
var thiersConnections = [];
var yourConnections = [];
var stream;

// Login when the user clicks the button
loginButton.addEventListener("click", function (event) {
  name = usernameInput.value;

  if (name.length > 0) {
    send({
      type : "login",
      name : name
    });
  }
});

connectButton.addEventListener("click", function () {
  var roomId = roomIdInput.value;

  if (roomId.length > 0) {
    room = roomId;
    send({
      type : "connect",
      roomid : roomId
    });
  } else {
    alert("You can't use empty name!");
  }
});

createButton.addEventListener("click", function () {
  var roomId = roomIdInput.value;

  if (roomId.length > 0) {
    room = roomId;
    send({
      type : "create",
      room : roomId
    });
  } else {
    alert("You can't use empty name!");
  }
});

function startPeerConnection(roomId) {
  

    // if (hasRTCPeerConnection()) {
//           setupPeerConnection(stream);
//         } else {
//           alert("Sorry, your browser does not support WebRTC.");
//         }

  // Begin the offer
  yourConnection.createOffer(function (offer) {
    send({
      type : "offer",
      offer : offer
    });

    yourConnection.setLocalDescription(offer);
  }, function (error) {
    alert("An error has occurred.");
  });
}

function onOffer(offer, name) {
  connectedUser = name;
  yourConnection.setRemoteDescription(new RTCSessionDescription(offer));

  yourConnection.createAnswer(function (answer) {
    yourConnection.setLocalDescription(answer);
    send({
      type : "answer",
      answer : answer
    });
  }, function (error) {
    alert("An error has occurred");
  });
}

function onAnswer(answer) {
  yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function onCandidate(candidate) {
  yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

function onLogin(success) {
  if (success == "false") {
    alert("Login unsuccessful, please try a different name.");
  } else {
    loginPage.style.display = "none";
    callPage.style.display = "block";

    // Get the plumbing ready for a call
    initializeUserCamera();
  }
}

function onCreate(success) {
  if (success == "false") {
    alert("Create room unsuccessful, please try a different name.");
    room = null;
  } else {
    connect
    connectButton.style.display = "none";
    createButton.style.display = "none";
    roomIdInput.style.display = "none";
  }
}

function onLeave() {
  console.log("TODO : onLeave not implemented");
}
  
connection.onopen = function () {
  console.log("Connected");
}


// Handle all messages through this callback
connection.onmessage = function (message) {
  console.log("Got message", message.data);

  var data = JSON.parse(message.data);
  switch(data.type) {
    case "login":
      onLogin(data.success);
      break;
    case "create":
      onCreate(data.success);
      break;
    case "offer":
      onOffer(data.offer, data.name);
      break;
    case "answer":
      onAnswer(data.answer);
      break;
    case "candidate":
      onCandidate(data.candidate);
      break;
    case "leave":
      onLeave();
      break;
    default:
      break;
  }
};

connection.onerror = function (err) {
  console.log("Got error", err);
};

// Alias for sending messages in JSON format
function send(message) {
  connection.send(JSON.stringify(message));
}

function initializeUserCamera() {
  if (hasUserMedia()) {
    navigator.getUserMedia({video : true, audio : false},
      function (myStream) {
        stream = myStream;
        yourVideo.src = window.URL.createObjectURL(stream);
      }, function (error) {
        console.log(error);
      });
  } else {
    alert("Sorry, your browser does not support WebRTC.");
  }
}

function setupPeerConnection(stream) {
  yourConnection = new RTCPeerConnection(configuration);

  // Setup stream listening
  yourConnection.addStream(stream);
  yourConnection.ontrack = function (e) {
    theirVideo.src = window.URL.createObjectURL(e.streams[0]);
  };

  // Setup ice handling
  yourConnection.onicecandidate = function (event) {
    if (event.candidate) {
      send({
        type : "candidate",
        candidate : event.candidate
      });
    }
  };
}

function hasUserMedia() {
  navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;
  return !!navigator.getUserMedia;
}

function hasRTCPeerConnection() {
  window.RTCPeerConnection = window.RTCPeerConnection ||
  window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  window.RTCSessionDescription = window.RTCSessionDescription ||
  window.webkitRTCSessionDescription ||
  window.mozRTCSessionDescription;
  window.RTCIceCandidate = window.RTCIceCandidate ||
  window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
  return !!window.RTCPeerConnection;
}
