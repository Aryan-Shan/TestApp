// Configuration
const config = {
    host: '0.peerjs.com',
    port: 443,
    secure: true,
    key: 'peerjs', // Using the default public key
};

let peer;
let localStream;
let call;
let connectionPeerId;
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const callButton = document.getElementById('call-button');
const connectButton = document.getElementById('connect-button');
const roleSelect = document.getElementById('role');

// Hardcoded Peer IDs
const callerPeerId = 'caller-peer';
const receiverPeerId = 'receiver-peer';

// Get local media stream
async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        console.log('Local stream acquired.');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera or microphone.');
    }
}

// Initialize Peer
function initializePeer(peerId) {
    peer = new Peer(peerId, config);

    // When peer connection is established
    peer.on('open', (id) => {
        console.log(`Peer connected with ID: ${id}`);
        alert(`Your Peer ID is: ${id}`);
    });

    // Handle incoming call
    peer.on('call', (incomingCall) => {
        console.log('Incoming call received...');
        incomingCall.answer(localStream);

        // Receive the remote stream
        incomingCall.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
            console.log('Remote stream received.');
        });

        // Handle call errors
        incomingCall.on('error', (err) => {
            console.error('Call error:', err);
        });
    });

    // Error handling
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        alert(`Error: ${err.message}`);
    });
}

// Make a call
function makeCall() {
    console.log('Attempting to make a call...');
    call = peer.call(connectionPeerId, localStream);

    call.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
        console.log('Call established, remote stream received.');
    });

    call.on('error', (err) => {
        console.error('Call error:', err);
        alert('Failed to establish call. Retrying...');
        setTimeout(makeCall, 2000); // Retry after 2 seconds
    });
}

// Connect as Caller or Receiver
connectButton.addEventListener('click', () => {
    const role = roleSelect.value;

    if (role === 'caller') {
        initializePeer(callerPeerId);
        connectionPeerId = receiverPeerId;
    } else {
        initializePeer(receiverPeerId);
        connectionPeerId = callerPeerId;
    }

    console.log(`Role selected: ${role}. Will connect to: ${connectionPeerId}`);
});

// Handle Call Button Click
callButton.addEventListener('click', () => {
    if (!localStream) {
        alert('Local stream not ready.');
        return;
    }

    if (!connectionPeerId) {
        alert('Connection peer ID is not set.');
        return;
    }

    makeCall();
});

// Get the local stream on page load
getLocalStream();
