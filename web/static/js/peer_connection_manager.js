// Default configuration for RTCPeerConnections
const PEER_CONN_CONFIG = {
  'iceServers': [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun.bcs2005.net:3478'
      ]
    },{
      urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
      credential: 'webrtc',
      username: 'webrtc'
    }
  ],
  'rtcpMuxPolicy': 'require'
}

// Abstraction over WebRTC that handles connection to peers
// via phoenix channel as signaling server
export default class PeerConnectionManager {

  ///
  // Receives id of current user, 
  // a phoenix channel that will be used for signalling
  // and an array of peer objects: 
  // {id: userId, connection: RTCPeerConnection, dataChannel: RTCDataChannel}
  constructor(currentUserId, signallingChannel, peers, onPeerAdded, onPeerRemoved) {
    this.currentUserId = currentUserId
    this.signallingChannel = signallingChannel
    this.peers = peers
    this.onPeerAdded = onPeerAdded
    this.onPeerRemoved = onPeerRemoved

    this.signallingChannel.on("signalling:sdp", data => this.onOfferReceived(data))
    this.signallingChannel.on("signalling:ice", data => this.onIceCandidateReceived(data))
  }

  /// Attempts to connect to remote peer by peerId
  connect(peerId) {
    let peer = this.createPeer(peerId)

    // Create an RTCDataChannel
    let dataChannel = peer.connection.createDataChannel("GameDataChannel", {ordered: true, maxPacketLifeTime: 1000, maxRetransmits: 3})
    dataChannel.onopen = (evt) => {
      console.log(`Data channel is opened: ${JSON.stringify(evt)}`)
      peer.dataChannel = dataChannel
    }

    // Create RDP offer and send it to peer
    peer.connection.createOffer()
      .then(desc => this.onLocalDescCreated(peer.id, desc, peer.connection))
      .catch((error) => console.log(`Error connecting to peer(${peerId}): ${JSON.stringify(error)}`))

  }

  disconnect(peerId) {
    let peer = this.peers.find(peer => peer.id === peerId)
    if (!peer) return

    // Close connection if it's not closed yet
    if (peer.connection.signalingState !== "closed") {
      peer.connection.close()
    }

    // Remove from peers list
    const peerIndex = this.peers.indexOf(peer)
    if(peerIndex != -1) {
      this.peers.splice(peerIndex, 1)
      this.onPeerRemoved(peer)
    }
  }

  onOfferReceived({to, from, sdp}) {
    // Handle only events that are intended for us
    if (to != this.currentUserId) return
    console.log(`Offer received from ${from} with dsp: ${JSON.stringify(sdp)}`)

    let peer = this.getOrCreatePeer(from)

    peer.connection.setRemoteDescription(new RTCSessionDescription(sdp))
      .then(() => {
        // If we received an offer, we need to answer
        if (peer.connection.remoteDescription.type === 'offer') {
          peer.connection.createAnswer().then(desc => this.onLocalDescCreated(peer.id, desc, peer.connection));
        } 

      })
      .catch(error => console.log(`Error receiving RDP offer from ${from}: ${JSON.stringify(error)}`));
  }

  onIceCandidateReceived({to, from, iceCandidate}) {
    // Handle only events that are intended for us
    if (this.currentUserId != to) return

    let peer = this.getOrCreatePeer(from)
    let rtcCandidate = new RTCIceCandidate(iceCandidate)
    console.log(`RTCIceCandidate created: ${JSON.stringify(rtcCandidate)}`)
    peer.connection
      .addIceCandidate(rtcCandidate)
      .then(() => console.log("Adding ICE candidate success"))
      .catch((error) => console.log(`Error adding ICE candidate: ${error}`))
  }


  createPeer(peerId) {
    // Create a connection and peer objects
    let conn = new RTCPeerConnection(PEER_CONN_CONFIG)
    let peer =  {id: peerId, connection: conn, dataChannel: null}

    // Send ice candidate to the peer once it's received from the STUN server
    conn.onicecandidate = (evt) => {
      console.log(`Received some ice event: ${JSON.stringify(evt)}`)
      if (evt.candidate) {
        console.log(`ICE candidate received: ${JSON.stringify(evt.candidate)}`)
        this.signallingChannel.push("signalling:ice", {peerId, "candidate": evt.candidate})
      }
    }

    // Add RTCDataChannel to peer object once it's created and opened
    conn.ondatachannel = (evt) => {
      evt.channel.onopen = () => {
        console.log("Data channel is opened!")
        peer.dataChannel = evt.channel
      }
    }

    console.log(`New peer object created: ${JSON.stringify(peer)}`)
    this.peers.push(peer)
    this.onPeerAdded(peer)
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
