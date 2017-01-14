import PeerConnectionManager from "../../web/static/js/peer_connection_manager.js"

describe('WebRTC layer', () => {
  it('connects to peer', () => {
    let signallingChannelMock = {}
    let peers = []
    let peerConnectionManager = new PeerConnectionManager(signallingChannelMock, peers)
    peerConnectionManager.connect("1")
    expect(peers).toEqual(jasmene.arrayContaining([{
      id: "1",
      dataChannel: jasmene.anything(),
      connection: jasmene.anything(),
    }]))
  })
})
