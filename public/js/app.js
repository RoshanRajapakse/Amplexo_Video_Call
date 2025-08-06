const startBtn = document.getElementById('startCall');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let ws, peerConnection;
const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

startBtn.addEventListener('click', () => {
  const userId = document.getElementById('userId').value.trim();
  const peerId = document.getElementById('peerId').value.trim();
  if (!userId || !peerId) return alert('Enter both IDs');

  ws = new WebSocket(`wss://${window.location.host}`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'register', sender: userId }));
  };
  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'offer') {
      await createPeerConnection(userId, peerId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: 'answer', answer, target: data.sender, sender: userId }));
    } else if (data.type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'ice-candidate') {
      try {
        await peerConnection.addIceCandidate(data.candidate);
      } catch (e) {
        console.error('Error adding ICE', e);
      }
    }
  };

  // Start local video and create offer
  startLocalVideo().then(async () => {
    await createPeerConnection(userId, peerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer, target: peerId, sender: userId }));
  });
});

async function startLocalVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = stream;
  return stream;
}

async function createPeerConnection(userId, peerId) {
  if (peerConnection) return;
  peerConnection = new RTCPeerConnection(servers);

  // Local tracks
  const localStream = localVideo.srcObject;
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // Remote track
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  // ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({ 
        type: 'ice-candidate', 
        candidate: event.candidate, 
        target: peerId, 
        sender: userId 
      }));
    }
  };
}
