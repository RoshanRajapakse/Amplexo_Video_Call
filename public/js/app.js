const joinBtn = document.getElementById('joinBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

joinBtn.addEventListener('click', async () => {
  const userId = document.getElementById('userId').value.trim();
  if (!userId) return alert('Enter a user ID');

  const response = await fetch('/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const { token, apiKey } = await response.json();

  const client = new StreamVideoClient(apiKey, { token });
  await client.connectUser({ id: userId }, token);

  const call = client.call('default', 'test-call');
  await call.join({ create: true });

  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  await call.publishStream(localStream);

  call.on('trackStarted', (event) => {
    if (event.track.kind === 'video') {
      remoteVideo.srcObject = new MediaStream([event.track]);
    }
  });
});
