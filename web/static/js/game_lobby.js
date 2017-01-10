let GameLobby = {
  guardianToken: "",
  peer: null,
  connections: [],

  init(socket, token, lobbyId) {
    this.guardianToken = token
    socket.connect({guardian_token: token})

    // Create a phoenix channel
    this.gameChannel = socket.channel(`game_lobby:${lobbyId}`, {})

    // Create a PeerJS peer
    this.peer = new Peer('unique_user_id', {key: 'rrj0sxbt1e3a0pb9'})
    //TODO: handle presence events
    //TODO: when received the first list of users after connection, fill connections
    //TODO: on new user connected to peer, add it to connections list

    this.gameChannel.join()
      .receive("ok", ({lobby}) => {
        $("#LobbyName").text(lobby.name)
      })
      .receive("error", resp => console.log("Cannot connect to game lobby: ", resp))

  }
}

export default GameLobby
