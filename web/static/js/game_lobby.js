// @flow
import PeerConnectionManager from "./peer_connection_manager";
import Game from "./football/game";

export default class GameLobby {
  peers: Array<Peer>;
  peerConnectionManager: ?PeerConnectionManager;
  currentUserId: string;
  gameChannel: any;
  game: Game;

  constructor(socket: any, token: string, lobbyId: string) {
    this.peers = [];
    this.currentUserId = window.userId.toString();

    socket.connect({guardian_token: token});

    this.gameChannel = this.buildGameChannel(socket, lobbyId);

    // Create a PeerConnectionManager for
    // establishing connections with peers via WebRTC DataChannel
    this.peerConnectionManager = new PeerConnectionManager(
      window.userId,
      this.gameChannel,
      this.peers,
      this.onPeerAdded,
      this.onPeerRemoved);

    // Connect to phoenix channel
    this.gameChannel.join()
      .receive("ok", ({lobby}) => $("#LobbyName").text(lobby.name))
      .receive("error", (resp) => console.log("Cannot connect to game lobby: ", resp));


    $("#StartGameBtn").click((evt) => this.onStartBtnClicked());
  }

  buildGameChannel(socket: any, lobbyId: string) {
    let gameChannel = socket.channel(`game_lobby:${lobbyId}`, {});

    // When first list of users is received after connection,
    // connect to other users and fill `peers` list
    gameChannel.on("presence_state", data => this.connectToAllUsers(data));

    // When some user is disconnected - remove it from peers list
    gameChannel.on("presence_diff", (diff) => this.onPresenceDiff(diff));

    gameChannel.on("game_is_ready", ({team1, team2}) => this.onGameIsReady(team1, team2));

    return gameChannel;
  }

  connectToAllUsers(usersData: Object) {
    if (!this.peerConnectionManager) {
      console.log("PeerConnectionManager is not instantiated");
      return;
    }

    for(let userId of Object.getOwnPropertyNames(usersData)) {
      if (userId == window.userId) {
        continue;
      }

      this.peerConnectionManager.connect(userId);
    }
  }

  onPresenceDiff({joins, leaves}: Object) {
    for(let userId of Object.getOwnPropertyNames(leaves)) {
      // If there is the same user in joins and leaves, 
      // then its metadata has updated, we shouldn't do anything with him
      if (joins.hasOwnProperty(userId)) {
        return;
      }

      if (!this.peerConnectionManager) {
        console.log('Connection manager is not found when disconnecting user');
        return;
      }
      this.peerConnectionManager.disconnect(userId);
    }
  }

  onPeerAdded(peer: Peer) {
    $("<div/>", {
      id: `User${peer.id}`,
      text: `User${peer.id}`
    }).appendTo("#UsersList");
  }

  onPeerRemoved(peer: Peer) {
    console.log("User removed: ", peer);
    $(`#User${peer.id}`).remove();
  }

  onStartBtnClicked() {
    this.gameChannel.push("player:status_changed", {status: "ready_to_play"});
  }

  onGameIsReady(team1: Array<string>, team2: Array<string>) {
    // Check what team current user belongs to
    let team = team1.indexOf(this.currentUserId) != -1;
    let position = team ? team1.indexOf(this.currentUserId) : team2.indexOf(this.currentUserId);

    let canvas = document.getElementById("GameCanvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      console.error("No canvas was found");
      return;
    }

    $("#LobbyInfo").hide();
    $(canvas).show();
    this.game = new Game(team, position, canvas);
    this.game.start();
  }

  notifyPeers(evtName: string, payload: Object) {
    for (const peer of this.peers) {
      const dc = peer.dataChannel;
      if (!dc) continue; 

      let obj = {
        evt: evtName,
        timestamp: new Date(),
        payload
      }

      dc.send(JSON.stringify(obj));
    }
  }
}
