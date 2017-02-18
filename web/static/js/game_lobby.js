// @flow
import PeerConnectionManager from "./peer_connection_manager";

export default class GameLobby {
  peers: Array<Peer>;
  peerConnectionManager: ?PeerConnectionManager;

  constructor(socket: any, token: string, lobbyId: string) {
    this.peers = [];
    this.peerConnectionManager = null;

    socket.connect({guardian_token: token});

    let gameChannel = this.buildGameChannel(socket, lobbyId);

    // Create a PeerConnectionManager for
    // establishing connections with peers via WebRTC DataChannel
    this.peerConnectionManager = new PeerConnectionManager(
      window.userId,
      gameChannel,
      this.peers,
      this.onPeerAdded,
      this.onPeerRemoved);

    // Connect to phoenix channel
    gameChannel.join()
      .receive("ok", ({lobby}) => $("#LobbyName").text(lobby.name))
      .receive("error", (resp) => console.log("Cannot connect to game lobby: ", resp));
  }

  buildGameChannel(socket: any, lobbyId: string) {
    let gameChannel = socket.channel(`game_lobby:${lobbyId}`, {});

    // When first list of users is received after connection,
    // connect to other users and fill `peers` list
    gameChannel.on("presence_state", data => this.connectToAllUsers(data));

    // When some user is disconnected - remove it from peers list
    gameChannel.on("presence_diff", ({joins, leaves}) => this.onUsersDisconnected(leaves));
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
}
