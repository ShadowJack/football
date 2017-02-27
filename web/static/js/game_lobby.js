// @flow
import PeerConnectionManager from "./peer_connection_manager";
import Game from "./football/game";

export default class GameLobby {
  peers: Array<Peer>;
  peerConnectionManager: ?PeerConnectionManager;
  currentUserId: string;
  gameChannel: any;

  constructor(socket: any, token: string, lobbyId: string) {
    this.peers = [];
    this.currentUserId = window.userId;

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
    gameChannel.on("presence_diff", ({joins, leaves}) => this.onUsersDisconnected(leaves));

    gameChannel.on("game_is_ready", () => this.onGameIsReady());

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

  onUsersDisconnected(disconnectedUsers: Object) {
    for(let userId of Object.getOwnPropertyNames(disconnectedUsers)) {
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
    $(`#User${peer.id}`).remove();
  }

  onStartBtnClicked() {
    this.gameChannel.push("player:status_changed", {status: "ready_to_play"});
  }

  onGameIsReady() {
    //TODO: randomly assign some team
    let team = true;
    let game = new Game(team);
    game.start();
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
