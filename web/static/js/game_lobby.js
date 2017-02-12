import PeerConnectionManager from "./peer_connection_manager"

let GameLobby = {
  peers: [],
  peerConnectionManager: null,

  init(socket, token, lobbyId) {
    socket.connect({guardian_token: token})

    let gameChannel = this.buildGameChannel(socket, lobbyId)

    // Create a PeerConnectionManager for
    // establishing connections with peers via WebRTC DataChannel
    this.peerConnectionManager = new PeerConnectionManager(
      window.userId,
      gameChannel,
      this.peers,
      this.onPeerAdded,
      this.onPeerRemoved)

    // Connect to phoenix channel
    gameChannel.join()
      .receive("ok", ({lobby}) => $("#LobbyName").text(lobby.name))
      .receive("error", (resp) => console.log("Cannot connect to game lobby: ", resp))
  },

  buildGameChannel(socket, lobbyId) {
    let gameChannel = socket.channel(`game_lobby:${lobbyId}`, {})

    // When first list of users is received after connection,
    // connect to other users and fill `peers` list
    gameChannel.on("presence_state", data => this.connectToAllUsers(data))

    // When some user is disconnected - remove it from peers list
    gameChannel.on("presence_diff", ({joins, leaves}) => this.onUsersDisconnected(leaves))
    return gameChannel
  },

  connectToAllUsers(usersData) {
    if (!this.peerConnectionManager) {
      console.log("PeerConnectionManager is not instantiated")
      return
    }

    for(let userId of Object.getOwnPropertyNames(usersData)) {
      if (userId == window.userId) {
        continue
      }

      this.peerConnectionManager.connect(userId)
    }
  },

  onUsersDisconnected(disconnectedUsers) {
    for(let userId of Object.getOwnPropertyNames(disconnectedUsers)) {
      this.peerConnectionManager.disconnect(userId)
    }
  },

  onPeerAdded(peer) {
    $("<div/>", {
      id: `User${peer.id}`,
      text: `User${peer.id}`
    }).appendTo("#UsersList")
  },

  onPeerRemoved(peer) {
    $(`#User${peer.id}`).remove()
  }
}

export default GameLobby
