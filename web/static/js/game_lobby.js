let GameLobby = {
  guardianToken: "",
  connections: [],

  init(socket, token, lobbyId) {
    this.guardianToken = token
    socket.connect({guardian_token: token})

    // Create a phoenix channel
    this.gameChannel = socket.channel(`game_lobby:${lobbyId}`, {})
    // Connect to phoenix channel
    this.gameChannel.join()
      .receive("ok", ({lobby}) => {
        $("#LobbyName").text(lobby.name)
      })
      .receive("error", resp => console.log("Cannot connect to game lobby: ", resp))

    // Handle presence events
    //

    // When first list of users is received after connection,
    // connect to other users and fill `connections` list
    this.gameChannel.on("presence_state", this.connectToAllUsers)

    // on new user connected to peer, add it to connections list
  },

  //TODO: move connection functionality to another object
  connectToAllUsers(usersData) {
      for(let userId of Object.getOwnPropertyNames(usersData)) {
        if (userId === window.userId) {
          continue
        }

        let peerConnection = new RTCPeerConnection(configuration);

        let dataChannel = peerConnection.createDataChannel(`sendDataChannelTo${userId}`);

        peerConnection.onicecandidate = iceCallback1;
        dataChannel.onopen = onSendChannelStateChange;

        peerConnection
          .createOffer()
          .done(this.onDescriptionReceived)
          .fail(error => console.log(`Can't create session description: ${error}`))
      }
  }
}

export default GameLobby
