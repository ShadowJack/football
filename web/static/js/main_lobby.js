let MainLobby = {
  init (socket) {
    socket.connect({guardian_token: window.guardian_token})

    let lobbyChannel = socket.channel("main_lobby:lobby", {})

    let lobbiesContainer = $("#LobbiesContainer")

    // Handle message that new lobby was created
    lobbyChannel.on("lobby:added", ({name}) => this.renderLobby(name, lobbiesContainer))

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
        game_lobbies.forEach(lobbyName => this.renderLobby(lobbyName, lobbiesContainer))
      })
      .receive("error", resp => { console.log("User is not authenticated", resp) })
  },

  renderLobby(name, container) {
    let template = document.createElement("li");

    template.innerHTML = name;

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
