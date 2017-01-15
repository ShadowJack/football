import PeerConnectionManager from "./peer_connection_manager"

let GameLobby = {
  guardianToken: "",
  peers: [],
  peerConnectionManager: null,

  init(socket, token, lobbyId) {
    this.guardianToken = token
    socket.connect({guardian_token: token})

    // Create a phoenix channel
    this.gameChannel = socket.channel(`game_lobby:${lobbyId}`, {})

    // Create a PeerConnectionManager for
    // establishing connections with peers via WebRTC DataChannel
    this.peerConnectionManager = new PeerConnectionManager(window.userId, this.gameChannel, this.peers)

    // Connect to phoenix channel
    this.gameChannel.join()
      .receive("ok", ({lobby}) => {
        $("#LobbyName").text(lobby.name)
      })
      .receive("error", resp => console.log("Cannot connect to game lobby: ", resp))


    // Handle presence events
    //

    // When first list of users is received after connection,
    // connect to other users and fill `peers` list
    this.gameChannel.on("presence_state", (data) => this.connectToAllUsers(data))

    //TODO: on user disconnected - remove it from connections list
  },

  connectToAllUsers(usersData) {
    if (!this.peerConnectionManager) {
      console.log("PeerConnectionManager is not instantiated")
      return;
    }

    for(let userId of Object.getOwnPropertyNames(usersData)) {
      if (userId == window.userId) {
        continue
      }

      this.peerConnectionManager.connect(userId)
    }
  }
}

export default GameLobby
