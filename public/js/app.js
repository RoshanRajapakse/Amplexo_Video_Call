// DOM Elements
const startBtn = document.getElementById('startCall');
const endBtn = document.getElementById('endBtn');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// State variables
let ws, peerConnection, localStream;
let isMuted = false;
let isVideoOff = false;
const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Initialize UI
function initializeUI() {
  updateStatus('disconnected', 'Ready to connect');
  endBtn.disabled = true;
  
  // Add event listeners for video controls
  muteBtn.addEventListener('click', toggleMute);
  videoBtn.addEventListener('click', toggleVideo);
  endBtn.addEventListener('click', endCall);
}

// Status management
function updateStatus(status, message) {
  statusIndicator.className = `status-indicator ${status}`;
  statusText.textContent = message;
}

// Toggle mute functionality
function toggleMute() {
  if (!localStream) return;
  
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    isMuted = !audioTrack.enabled;
    
    muteBtn.classList.toggle('active', isMuted);
    muteBtn.innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
  }
}

// Toggle video functionality
function toggleVideo() {
  if (!localStream) return;
  
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    isVideoOff = !videoTrack.enabled;
    
    videoBtn.classList.toggle('active', isVideoOff);
    videoBtn.innerHTML = isVideoOff ? '<i class="fas fa-video-slash"></i>' : '<i class="fas fa-video"></i>';
  }
}

// End call functionality
function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // Reset videos
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  
  // Reset UI
  updateStatus('disconnected', 'Ready to connect');
  startBtn.disabled = false;
  endBtn.disabled = true;
  muteBtn.disabled = true;
  videoBtn.disabled = true;
  
  // Reset control buttons
  muteBtn.classList.remove('active');
  videoBtn.classList.remove('active');
  muteBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  videoBtn.innerHTML = '<i class="fas fa-video"></i>';
  
  // Show video placeholders
  document.querySelectorAll('.video-overlay').forEach(overlay => {
    overlay.classList.remove('hidden');
  });
}

// Start call functionality
startBtn.addEventListener('click', async () => {
  const userId = document.getElementById('userId').value.trim();
  const peerId = document.getElementById('peerId').value.trim();
  
  if (!userId || !peerId) {
    alert('Please enter both Your ID and Peer ID');
    return;
  }

  try {
    updateStatus('connecting', 'Connecting...');
    startBtn.disabled = true;
    
    // Start local video first
    await startLocalVideo();
    
    // Connect WebSocket
    ws = new WebSocket(`wss://${window.location.host}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      updateStatus('connecting', 'Establishing connection...');
      ws.send(JSON.stringify({ type: 'register', sender: userId }));
    };
    
    ws.onmessage = async (event) => {
      console.log('Message received:', event.data);
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
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      updateStatus('disconnected', 'Connection failed');
      startBtn.disabled = false;
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      updateStatus('disconnected', 'Connection lost');
      startBtn.disabled = false;
    };

    // Create offer after WebSocket is connected
    setTimeout(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        await createPeerConnection(userId, peerId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', offer, target: peerId, sender: userId }));
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error starting call:', error);
    updateStatus('disconnected', 'Failed to start call');
    startBtn.disabled = false;
    alert('Failed to start call. Please check your camera and microphone permissions.');
  }
});

// Start local video
async function startLocalVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }, 
      audio: true 
    });
    
    localVideo.srcObject = localStream;
    
    // Hide local video placeholder
    const localOverlay = localVideo.parentElement.querySelector('.video-overlay');
    if (localOverlay) {
      localOverlay.classList.add('hidden');
    }
    
    // Enable control buttons
    muteBtn.disabled = false;
    videoBtn.disabled = false;
    
    return localStream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
}

// Create peer connection
async function createPeerConnection(userId, peerId) {
  if (peerConnection) return;
  
  peerConnection = new RTCPeerConnection(servers);

  // Add local tracks
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    console.log('Remote stream received');
    remoteVideo.srcObject = event.streams[0];
    
    // Hide remote video placeholder
    const remoteOverlay = remoteVideo.parentElement.querySelector('.video-overlay');
    if (remoteOverlay) {
      remoteOverlay.classList.add('hidden');
    }
    
    updateStatus('connected', 'Connected');
    endBtn.disabled = false;
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending ICE candidate');
      ws.send(JSON.stringify({ 
        type: 'ice-candidate', 
        candidate: event.candidate, 
        target: peerId, 
        sender: userId 
      }));
    }
  };

  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
    switch (peerConnection.connectionState) {
      case 'connected':
        updateStatus('connected', 'Connected');
        break;
      case 'disconnected':
        updateStatus('disconnected', 'Disconnected');
        break;
      case 'failed':
        updateStatus('disconnected', 'Connection failed');
        break;
    }
  };

  // Handle ICE connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', peerConnection.iceConnectionState);
  };
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', initializeUI);
