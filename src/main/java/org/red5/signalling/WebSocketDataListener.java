package org.red5.signalling;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;

import javax.websocket.OnMessage;
import javax.websocket.PongMessage;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Handler / router for chat data.
 * 
 * @author Paul Gregoire, Dmitry Bezheckov
 */

@ServerEndpoint("/ws")
public class WebSocketDataListener {
	
	Writer writer;
	OutputStream stream;

    private static final Logger log = Red5LoggerFactory.getLogger(WebSocketDataListener.class, "signalling");
	
	@OnMessage
    public void echoTextMessage(Session session, String msg, boolean last) throws IOException {
		log.info("echoTextMessage");
		if (writer == null) {
            writer = session.getBasicRemote().getSendWriter();
        }
        writer.write(msg);
        if (last) {
            writer.close();
            writer = null;
        }
    }

    @OnMessage
    public void echoBinaryMessage(byte[] msg, Session session, boolean last) throws IOException {
    	log.info("echoBinaryMessage");
    	if (stream == null) {
            stream = session.getBasicRemote().getSendStream();
        }
        stream.write(msg);
        stream.flush();
        if (last) {
            stream.close();
            stream = null;
        }
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
