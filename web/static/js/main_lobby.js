let MainLobby = {
  init (socket) {
    socket.connect({guardian_token: window.guardian_token})

    let lobbyChannel = socket.channel("main_lobby:lobby", {})

    let lobbiesContainer = $("#LobbiesContainer")

    // Handle message that new lobby was created
    lobbyChannel.on("lobby:added", (lobby) => this.renderLobby(lobby, lobbiesContainer))

    // Setup event handlers
    $("#AddLobbyBtn").click(e => this.onAddLobbyClick(e, lobbyChannel))
    $(".close").click(e => {
      let alert = $(e.currentTarget).parent()
      alert.hide()
    })

    // Join the channel
    lobbyChannel.join()
      .receive("ok", ({game_lobbies}) => {
        lobbiesContainer.empty()
        game_lobbies.forEach(lobby => this.renderLobby(lobby, lobbiesContainer))
      })
      .receive("error", resp => { console.log("User is not authenticated", resp) })
  },

  renderLobby(lobby, container) {
    // TODO: put link to the game lobby
    let template = $("<li></li>");
    template.attr("data-id", lobby.id)
    template.attr("data-created-at", lobby.created_at)
    template.text(lobby.name);

    container.prepend(template);
  },

  onAddLobbyClick(evt, channel) {
    evt.preventDefault()
    let newLobbyNameInput = $("#LobbyNameInput")
    channel.push("lobby:add", {name: newLobbyNameInput.val()}, 5000)
      .receive("ok", msg => console.log("lobby:add response", msg)) 
      .receive("error", msg => {
        $(".alert-danger .alert-text").text(msg.reason)
        $(".alert-danger").show()
      })
    newLobbyNameInput.val("")
  }
}

export default MainLobby
