package org.red5.signalling;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import javax.websocket.OnMessage;
import javax.websocket.PongMessage;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Handler / router for chat data.
 * 
 * @author Paul Gregoire
 */
public class WebSocketChatDataListener {

    private static final Logger log = Red5LoggerFactory.getLogger(WebSocketChatDataListener.class, "signalling");

    private Router router;

    public void setRouter(Router router) {
        this.router = router;
        this.router.setWsListener(this);
    }

	public void sendToAll(String contextPath, String message) {
		// TODO Auto-generated method stub
	}

}
