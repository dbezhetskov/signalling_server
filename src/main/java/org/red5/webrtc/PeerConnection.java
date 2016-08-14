package org.red5.webrtc;

import org.red5.logging.Red5LoggerFactory;
import org.red5.signalling.SignalConnection;
import org.slf4j.Logger;

public class PeerConnection {
	
	private static final Logger LOG = Red5LoggerFactory.getLogger(SignalConnection.class, "signalling");
	
	static {
		System.load("/home/dmitry/code/red5-server/target/red5-server/shared/lib/webrtc.so");
	}
	
	public PeerConnection() {
		initialize();
	}
	
	private native void initialize();
	
	private native void uninitialize();
	
	public native void createOffer();
	
	public native void createAnswer();
	
	public native void setRemoteDescription(String offer);
	
	public void onStreamChunk(byte[] buffer) {
		LOG.info("onStreamChunk : " + buffer.length);
	}
	
	public void onIceCandidate(String iceCandidate) {
		LOG.info("ICE BEGIN\n" + iceCandidate + "ICE END\n");
	}
	
	public void onOffer(String offer) {
		LOG.info("Offer BEGIN\n" + offer + "Offer END\n");
	}
	
	public void onAnswer(String answer) {
		LOG.info("Answer BEGIN\n" + answer + "Answer END\n");
	}
}
