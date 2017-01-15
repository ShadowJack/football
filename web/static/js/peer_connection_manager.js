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

  ///
  // Receives a phoenix channel that will be used for signalling
  // and an array of peer objects: 
  // {id: userId, connection: RTCPeerConnection, dataChannel: RTCDataChannel}
  constructor(signallingChannel, peers) {
    this.signallingChannel = signallingChannel
    this.peers = peers

    this.signallingChannel.on("signalling:sdp", onOfferReceived)
    this.signallingChannel.on("signalling:ice", ({from, iceCandidate}) => {
      let peer = getOrCreatePeer(from)
      peer.connection.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })
  }

  ///
  // Attempts to connect to remote peer by peerId
  // Returns {peerConnection, dataChannel}
  connect(peerId) {
    let peer = createPeer(peerId)
    peer.connection.createOffer(peerId)
      .then(desc => this.onLocalDescCreated(desc, peer.connection))
      .catch((error) => console.log(`Error connecting to peer(${this.peerId}): ${error}`))
 
    // Create an RTCDataChannel
    let dataChannel = peer.connection.createDataChannel("DataChannel", {ordered: true, maxPacketLifeTime: 1000, maxRetransmits: 3})
    peer.dataChannel = dataChannel
  }

  onOfferReceived({from, sdp}) => {
    let peer = getOrCreatePeer(from)

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
      evt.channel.onopen = () => peer.dataChannel = evt.channel
    }


    this.peers.push(peer)
    return peer
  }

  // Find a peer by id or create a new one
  getOrCreatePeer(peerId) {
    // If player connection doesn't exist yet - create a new one
    let peer = this.peers.find(peer => peer.id === from)
    if (peer) {
      return peer
    }
    return this.createPeer(from)
  }

  ///
  // Set local description and send an offer to the peer
  onLocalDescCreated(desc, connection) {
    connection
      .setLocalDescription(desc)
      .then(() => {
        signallingChannel.push("signalling:sdp", {peerId, "desc": connection.localDescription})
      })
  }
}
