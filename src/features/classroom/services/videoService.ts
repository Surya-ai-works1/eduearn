// Classroom Live Video Service Adapter
// Manages web-native video streams and generates simulated Agora peer streams.

export interface PeerParticipant {
  id: string;
  name: string;
  role: "tutor" | "learner";
  cameraOn: boolean;
  muted: boolean;
  raisedHand: boolean;
  volume: number; // 0-100 speaker volume simulator
  connectionQuality: "Good" | "Fair" | "Poor";
  isLocal?: boolean;
}

const mockPeers: PeerParticipant[] = [
  { id: "peer-1", name: "Ananya Iyer (Tutor)", role: "tutor", cameraOn: true, muted: false, raisedHand: false, volume: 45, connectionQuality: "Good" },
  { id: "peer-2", name: "Rohan Gupta", role: "learner", cameraOn: true, muted: true, raisedHand: false, volume: 0, connectionQuality: "Good" },
  { id: "peer-3", name: "Sneha Sen", role: "learner", cameraOn: false, muted: true, raisedHand: true, volume: 0, connectionQuality: "Fair" },
  { id: "peer-4", name: "Vikram Malhotra", role: "learner", cameraOn: true, muted: false, raisedHand: false, volume: 15, connectionQuality: "Good" },
];

export const VideoService = {
  /**
   * Returns STUN/TURN Ice Server configurations for WebRTC peer signaling.
   */
  getIceServers(): RTCConfiguration {
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    };
  },

  /**
   * Creates a new RTCPeerConnection instance using Google STUN ICE servers.
   */
  createPeerConnection(): RTCPeerConnection | null {
    if (typeof window !== "undefined" && window.RTCPeerConnection) {
      return new RTCPeerConnection(this.getIceServers());
    }
    return null;
  },

  /**
   * Captures the user's local webcam stream using web-native MediaDevices API.
   */
  async getLocalVideoStream(): Promise<MediaStream | null> {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        return await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable. Falling back to simulated streams.", err);
    }
    return null;
  },

  /**
   * Stops a media stream (releasing the camera light).
   */
  stopStream(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  },

  /**
   * Fetches mock peer participants to display in the classroom grid.
   */
  getMockPeers(isTutor: boolean, localName: string): PeerParticipant[] {
    const localUser: PeerParticipant = {
      id: "local-user",
      name: `${localName} (You)`,
      role: isTutor ? "tutor" : "learner",
      cameraOn: true,
      muted: false,
      raisedHand: false,
      volume: 0,
      connectionQuality: "Good",
      isLocal: true,
    };
    
    // If the local user is a tutor, filter out the mock tutor so there's only one tutor in the class
    const list = isTutor ? mockPeers.filter((p) => p.role !== "tutor") : [...mockPeers];
    return [localUser, ...list];
  },
};
