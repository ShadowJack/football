// @flow
type Lobby = {id: string, name: string, created_at: any}

export default class MainLobby {
  guardian_token: string;

  constructor (socket: any, token: string) {
    this.guardian_token = token;
    socket.connect({guardian_token: token});

    let lobbyChannel = socket.channel("main_lobby:lobby", {});

    let lobbiesContainer = $("#LobbiesContainer");

    // Handle message that new lobby was created
    lobbyChannel.on("lobby:added", (lobby) => this.renderLobby(lobby, lobbiesContainer));

    // Setup event handlers
    $("#AddLobbyBtn").click(e => {
      e.preventDefault();
      this.addLobby(lobbyChannel);
    });
    $("#LobbyNameInput").keyup(e => {
      if (e.keyCode == 13) {
        this.addLobby(lobbyChannel);
      }
    });
    $(".close").click(e => {
      let alert = $(e.currentTarget).parent();
      alert.hide();
    })

    // Join the channel
    lobbyChannel.join()
      .receive("ok", ({game_lobbies}) => {
        lobbiesContainer.empty();
        game_lobbies.forEach(lobby => this.renderLobby(lobby, lobbiesContainer));
      })
      .receive("error", resp => { console.log("User is not authenticated", resp) });
  }

  renderLobby(lobby: Lobby, container: any) {
    let template = $("<li></li>");
    template.attr("data-created-at", lobby.created_at);
    template.html(this.getLinkToLobby(lobby));

    container.prepend(template);
  }

  addLobby(channel: any) {
    let newLobbyNameInput = $("#LobbyNameInput");
    channel.push("lobby:add", {name: newLobbyNameInput.val()}, 5000)
      .receive("ok", msg => console.log("lobby:add response", msg)) 
      .receive("error", msg => {
        $(".alert-danger .alert-text").text(msg.reason);
        $(".alert-danger").show();
      });
    newLobbyNameInput.val("");
  }

  getLinkToLobby(lobby: Lobby) {
    return `<a href="/${lobby.id}?token=${this.guardian_token}">${lobby.name}</a>`;
  }
}
