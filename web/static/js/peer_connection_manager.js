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
export default class PeerConnectionManager {

  ///
  // Receives id of current user, 
  // a phoenix channel that will be used for signalling
  // and an array of peer objects: 
  // {id: userId, connection: RTCPeerConnection, dataChannel: RTCDataChannel}
  constructor(currentUserId, signallingChannel, peers) {
    this.currentUserId = currentUserId
    this.signallingChannel = signallingChannel
    this.peers = peers

    this.signallingChannel.on("signalling:sdp", data => this.onOfferReceived(data))
    this.signallingChannel.on("signalling:ice", ({to, from, iceCandidate}) => {
      // Handle only events that are intended for us
      if (this.currentUserId !== to) return

      let peer = this.getOrCreatePeer(from)
      peer.connection.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })
  }

  /// Attempts to connect to remote peer by peerId
  // Returns {peerConnection, dataChannel}
  connect(peerId) {
    let peer = this.createPeer(peerId)
    peer.connection.createOffer()
      .then(desc => this.onLocalDescCreated(peer.id, desc, peer.connection))
      .catch((error) => console.log(`Error connecting to peer(${peerId}): ${error}`))
 
    // Create an RTCDataChannel
    let dataChannel = peer.connection.createDataChannel("GameDataChannel", {ordered: true, maxPacketLifeTime: 1000, maxRetransmits: 3})
    console.log("Data channel created!")
    dataChannel.onopen = (evt) => peer.dataChannel = dataChannel
  }

  onOfferReceived({to, from, sdp}) {
    // Handle only events that are intended for us
    if (to != this.currentUserId) return

    let peer = this.getOrCreatePeer(from)

    peer.connection.setRemoteDescription(new RTCSessionDescription(sdp))
      .then(() => {
        // If we received an offer, we need to answer
        if (peer.connection.remoteDescription.type === 'offer') {
          peer.connection.createAnswer().then(desc => this.onLocalDescCreated(peer.id, desc, peer.connection));
        }
      })
      .catch(error => console.log(`Error receiving RDP offer from ${from}: ${error}`));
  }

  createPeer(peerId) {
    // Create a connection and peer objects
    let conn = new RTCPeerConnection(PEER_CONN_CONFIG)
    let peer =  {id: peerId, connection: conn, dataChannel: null}

    // Send ice candidate to the peer once it's received from the STUN server
    conn.onicecandidate = (evt) => {
      if (evt.candidate) {
        this.signallingChannel.push("signalling:ice", {peerId, "candidate": evt.candidate})
      }
    }

    // Add RTCDataChannel to peer object once it's created and opened
    conn.ondatachannel = (evt) => {
      console.log("Data channel created!")
      evt.channel.onopen = () => peer.dataChannel = evt.channel
    }

    this.peers.push(peer)
    return peer
  }

  // Find a peer by id or create a new one
  getOrCreatePeer(peerId) {
    // If player connection doesn't exist yet - create a new one
    let peer = this.peers.find(peer => peer.id === peerId)
    if (peer) {
      return peer
    }
    return this.createPeer(peerId)
  }

  ///
  // Set local description and send an offer to the peer
  onLocalDescCreated(peerId, desc, connection) {
    connection
      .setLocalDescription(desc)
      .then(() => {
        this.signallingChannel.push("signalling:sdp", {peerId, "desc": connection.localDescription})
      })
  }
}
