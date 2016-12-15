let MainLobby = {
  init (socket) {
    socket.connect({guardian_token: window.guardian_token})

    let lobbyChannel = socket.channel("main_lobby:lobby", {})

    lobbyChannel.join()
      .receive("ok", ({game_lobbies}) => { 
        console.log("Joined successfully", game_lobbies) 
        let lobbiesContainer = document.getElementById("LobbiesContainer")
        console.log("container: ", lobbiesContainer)
        game_lobbies.forEach(lobbyName => this.renderLobby(lobbyName, lobbiesContainer))
        
      })
      .receive("error", resp => { console.log("User is not authenticated", resp) })
  },

  renderLobby(name, container) {
    let template = document.createElement("li");

    template.innerHTML = name;

    container.appendChild(template);
  },
}

export default MainLobby
