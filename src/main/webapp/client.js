var name; // yours nickname
var room; // you are connected to this room
var connection = new WebSocket('ws://localhost:5080/signalling/ws');

var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#username');
var loginButton = document.querySelector('#login');
var callPage = document.querySelector('#call-page');
var thiersVideoContainer = document.querySelector('#theirs');
var roomIdInput = document.querySelector('#room-id');
var connectButton = document.querySelector('#connect');
var createButton = document.querySelector('#create');
var hangUpButton = document.querySelector('#hang-up');
var yourVideo = document.querySelector("#yours");
callPage.style.display = "none";

var configuration = {
  "iceservers" : [{ "url" : "stun:stun.1.google.com:19302" }]
};
var thiersVideos = [];
var yourConnections = new Map();
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
      room : roomId
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
  let connection = new RTCPeerConnection(configuration);
  connection.setRemoteDescription(new RTCSessionDescription(offer));
  yourConnections.set(name, connection);

  let video = document.createElement('video');
  video.autoplay = true;
  thiersVideoContainer.appendChild(video);

  // Setup stream listening
  connection.addStream(stream);
  connection.ontrack = function (e) {
    video.src = window.URL.createObjectURL(e.streams[0]);
  };

  // Begin the answer
  connection.createAnswer(function (answer) {
    connection.setLocalDescription(answer);
    send({
      type : "answer",
      answer : answer,
      name : name
    });
  }, function (error) {
    alert("An error has occurred in answer: " + error);
  });

  // Setup ice handling
  connection.onicecandidate = function (event) {
    if (event.candidate) {
      send({
        type : "candidate",
        candidate : event.candidate,
        name : name
      });
    }
  };
}

function onAnswer(answer, name) {
  let connection = yourConnections.get(name);
  if (connection != null) {
    connection.setRemoteDescription(new RTCSessionDescription(answer));
  } else {
    alert("Anwser: Can't find " + name + " in connections map");
  }
}

function onCandidate(candidate, name) {
  let connection = yourConnections.get(name);
  if (connection != null) {
    connection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    alert("Candidate: Can't find " + name + " in connections map");
  }
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
    connectButton.style.display = "none";
    createButton.style.display = "none";
    roomIdInput.style.display = "none";
  }
}

function onConnect(name) {
  if (name) {
    let connection = new RTCPeerConnection(configuration);

    let video = document.createElement('video');
    video.autoplay = true;
    thiersVideoContainer.appendChild(video);

    yourConnections.set(name, connection);

    // Setup stream listening
    connection.addStream(stream);
    connection.ontrack = function (e) {
      video.src = window.URL.createObjectURL(e.streams[0]);
    };

    // Begin the offer
    connection.createOffer(function (offer) {
      send({
        type : "offer",
        offer : offer,
        name : name
      });
      connection.setLocalDescription(offer);
    }, function (error) {
      alert("An error has occurred in onConnect");
    });

    // Setup ice handling
    connection.onicecandidate = function (event) {
      if (event.candidate) {
        send({
          type : "candidate",
          candidate : event.candidate,
          name : name
        });
      }
    };
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
    case "connect":
      onConnect(data.name);
      break;
    case "offer":
      onOffer(data.offer, data.name);
      break;
    case "answer":
      onAnswer(data.answer, data.name);
      break;
    case "candidate":
      onCandidate(data.candidate, data.name);
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
  console.log("We send " + JSON.stringify(message));
  connection.send(JSON.stringify(message));
}

function initializeUserCamera() {
  if (hasUserMedia()) {
    navigator.getUserMedia({video : true, audio : false},
      function (myStream) {
        stream = myStream;
        yourVideo.src = window.URL.createObjectURL(stream);
        if (!hasRTCPeerConnection()) {
          alert("Sorry, your browser does not support WebRTC.");
          connection = null; // nothing to send to the signal server
        }},
        function (error) {
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
