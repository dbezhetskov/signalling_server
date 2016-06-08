var name;
var connectedUser;
var connection = new WebSocket('ws://localhost:5080/signalling/ws');

var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#username');
var loginButton = document.querySelector('#login');
var callPage = document.querySelector('#call-page');
var theirUsernameInput = document.querySelector('#their-username');
var callButton = document.querySelector('#call');
var hangUpButton = document.querySelector('#hang-up');
callPage.style.display = "none";

var yourVideo = document.querySelector("#yours");
var theirVideo = document.querySelector("#theirs");
var yourConnection;
var connectedUser;
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

callButton.addEventListener("click", function () {
  var theirUserName = theirUsernameInput.value;

  if (theirUserName.length > 0) {
    startPeerConnection(theirUserName);
  }
});

function startPeerConnection(user) {
  connectedUser = user;

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
  if (success === false) {
    alert("Login unsuccessful, please try a different name.");
  } else {
    loginPage.style.display = "none";
    callPage.style.display = "block";

    // Get the plumbing ready for a call
    startConnection();
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
  if (connectedUser) {
    message.name = connectedUser;
  }

  connection.send(JSON.stringify(message));
}

function startConnection() {
  if (hasUserMedia()) {
    navigator.getUserMedia({video : true, audio : false},
      function (myStream) {
        stream = myStream;
        yourVideo.src = window.URL.createObjectURL(stream);

        if (hasRTCPeerConnection()) {
          setupPeerConnection(stream);
        } else {
          alert("Sorry, your browser does not support WebRTC.");
        }
      },
      function (error) {
        console.log(error);
      });
  } else {
    alert("Sorry, your browser does not support WebRTC.");
  }
}

function setupPeerConnection(stream) {
  var configuration = {
    "iceservers" : [{ "url" : "stun:stun.1.google.com:19302" }]
  };

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
