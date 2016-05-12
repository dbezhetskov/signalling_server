package org.red5.signalling;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import java.io.IOException;

import javax.websocket.OnMessage;
import javax.websocket.PongMessage;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Handler / router for chat data.
 * 
 * @author Paul Gregoire, Dmitry Bezheckov
 */

@ServerEndpoint("/")
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
	
	@OnMessage
    public void echoTextMessage(Session session, String msg, boolean last) throws IOException {
    	System.out.println("echoTextMessage");
    	System.exit(0);
    }

    @OnMessage
    public void echoBinaryMessage(byte[] msg, Session session, boolean last) throws IOException {
    	System.out.println("echoBinaryMessage");
    	System.exit(0);
    }

    /**
     * Process a received pong. This is a NO-OP.
     *
     * @param pm    Ignored.
     */
    @OnMessage
    public void echoPongMessage(PongMessage pm) {
        // NO-OP
    }

}
