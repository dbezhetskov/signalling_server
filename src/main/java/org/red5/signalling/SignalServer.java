package org.red5.signalling;

import org.json.JSONException;
import org.json.JSONObject;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import java.io.IOException;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;


/**
 * 
 * @author Dmitry Bezheckov
 */

@ServerEndpoint("/ws")
public class SignalServer {
	private static final Logger log = Red5LoggerFactory.getLogger(SignalServer.class, "signalling");
	
    @OnOpen
    public void onOpen(Session session) throws IOException {
    	log.info("User connected");
        session.getBasicRemote().sendText("Ok, you are connected");
    }

    @OnMessage
    public String onMessage(String message) {
    	log.info("Got message: " + message);
    	
    	try {
			JSONObject data = new JSONObject(message);
			log.info("Id: " + data.get("ID"));
		} catch (JSONException e) {
			log.error("Error parsing JSON " + e.getMessage());
		}
    	
        return message + " (from your server)";
    }

    @OnError
    public void onError(Throwable t) {
    	log.error("Error " + t.getMessage());
    }

    @OnClose
    public void onClose(Session session) {
    	log.info("User disconnected");
    }
}
