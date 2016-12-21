let GameLobby = {
  guardian_token: "",

  init(socket, token, lobbyId) {
    this.guardian_token = token
    socket.connect({guardian_token: token})

    let gameChannel = socket.channel(`game_lobby:${lobbyId}`, {})

    gameChannel.join()
      .receive("ok", ({lobby}) => {
        $("#LobbyName").text(lobby.name)
      })
      .receive("error", resp => console.log("Cannot connect to game lobby: ", resp))
  }
}

export default GameLobby
