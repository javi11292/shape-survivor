export const connect = () => {
	const config = {
		iceServers: [{ urls: "stun:stun.mystunserver.tld" }],
	};

	const signaler = {}; // TODO

	const peer = new RTCPeerConnection(config);

	let makingOffer = false;
	peer.onnegotiationneeded = async () => {
		try {
			makingOffer = true;
			await pc.setLocalDescription();
			signaler.send({ description: pc.localDescription });
		} catch (err) {
			console.error(err);
		} finally {
			makingOffer = false;
		}
	};

	pc.onicecandidate = ({ candidate }) => signaler.send({ candidate });
};
