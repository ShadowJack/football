declare class RTCPeerConnection {
  constructor(config: any): RTCPeerConnection;

  addIceCandidate(candidate: any): Promise<*>;

  onicecandidate: (event: any) => any;
  ondatachannel: (datachannel: any) => any;
  localDescription: RTCSessionDescription;
  remoteDescription: RTCSessionDescription;
  signalingState: string;

  setLocalDescription(desc: RTCSessionDescription): Promise<*>;
  setRemoteDescription(desc: RTCSessionDescription): Promise<*>;

  createDataChannel(label: string, options: any): any;

  createOffer(): Promise<*>;
  createAnswer(): Promise<*>;

  close(): void;
}

declare class RTCIceCandidate {
  constructor(iceCandidate: any): this;
}

declare class RTCDataChannel {
  close(): void;
  send(data: string): void;
}

declare class RTCSessionDescription {
  constructor(sdp: any): RTCSessionDescription;
  type: string;
}
