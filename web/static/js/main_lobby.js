let MainLobby = {
  guardian_token: "",

  init (socket, token) {
    this.guardian_token = token
    socket.connect({guardian_token: token})

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
    let template = $("<li></li>");
    template.attr("data-created-at", lobby.created_at)
    template.html(this.getLinkToLobby(lobby));

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
  },

  getLinkToLobby(lobby) {
    return `<a href="/${lobby.id}?token=${this.guardian_token}">${lobby.name}</a>`
  }
}

export default MainLobby
