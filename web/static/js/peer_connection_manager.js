const PEER_CONN_CONFIG = {
  iceCandidatePoolSize: 8,
  // Servers object is taken from 
  // https://github.com/gutnikov/webrtc-shooter/blob/master/lib/net/peer-connection.js
  iceServers: [{
    url: 'stun:stun.l.google.com:19302'
  },{
    url: 'stun:stun.anyfirewall.com:3478'
  },{
    url: 'turn:turn.bistri.com:80',
    credential: 'homeo',
    username: 'homeo'
  },{
    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
    credential: 'webrtc',
    username: 'webrtc'
  }]
}

// Abstraction over WebRTC that handles connection to peers
// via phoenix channel as signaling server
export class PeerConnectionManager {
  constructor(signallingChannel, peers) {
    this.signallingChannel = signallingChannel
    this.peers = peers

    this.signallingChannel.on("signalling:sdp", onOfferReceived)
    this.signallingChannel.on("signalling:ice", ({from, iceCandidate}) => {
      //TODO: find a player, if exists, otherwise - create a new one and add a new candidate
    })
  }

  ///
  // Attempts to connect to remote peer by peerId
  // Returns {peerConnection, dataChannel}
  connect(peerId) {
    let peer = createPeer(peerId)
    this.peers.push(peer)
    peer.connection.createOffer(peerId)
      .then(desc => this.onLocalDescCreated(desc, peer.connection))
      .catch((error) => console.log(`Error connecting to peer(${this.peerId}): ${error}`))
  }

  onOfferReceived({from, sdp}) => {
    // Find a player connection
    // If player connection doesn't exist yet - create a new one
    let peer = this.peers.find(peer => peer.id === from)
    if (!peer) {
      peer = this.createPeer(from)
      peers.push(peer)
    }

    peer.connection.setRemoteDescription(new RTCSessionDescription(sdp))
      .then(() => {
        // if we received an offer, we need to answer
        if (peer.connection.remoteDescription.type === 'offer') {
          peer.connection.createAnswer().then(desc => this.onLocalDescCreated(desc, peer.connection));
        }
      })
      .catch(error => console.log(`Error receiving RDP offer from ${from}: ${error}`));

  }

  createPeer(peerId) {
    // TODO: add ice event handlers
    let conn = new RTCPeerConnection(PEER_CONN_CONFIG)
    return {id: peerId, connection: conn, dataChannel: null}
  }

  ///
  // Set local description and send an offer to the peer
  onLocalDescCreated(desc, connection) {
    connection
      .setLocalDescription(desc)
      .then(() => {
        signallingChannel.push("signalling:sdp", {peerId, connection.localDescription})
      })
  }
}
