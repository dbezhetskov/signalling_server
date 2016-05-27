package org.red5.signalling;

import org.json.JSONException;
import org.json.JSONObject;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import java.io.IOException;
import java.util.HashMap;
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
	
	private static final Logger LOG = Red5LoggerFactory.getLogger(SignalServer.class, "signalling");
	private static final JSONObject LOGIN_SUCCESS_MESSAGE;
	private static final JSONObject LOGIN_FAIL_MESSAGE;
	
	private final HashMap<String, Session> users = new HashMap<String, Session>();
	
	static
	{
		JSONObject loginTrueMessage = null;
		JSONObject loginFalseMessage = null;
		
		try {
			loginTrueMessage = new JSONObject("{ \"TYPE\" : \"Login\", \"SUCCESS\" : \"true\"}");
			loginFalseMessage = new JSONObject("{ \"TYPE\" : \"Login\", \"SUCCESS\" : \"false\"}");
		} catch (JSONException e) {
			LOG.error("json constant haven't constructed " + e.getMessage());
		}
		
		LOGIN_SUCCESS_MESSAGE = loginTrueMessage;
		LOGIN_FAIL_MESSAGE = loginFalseMessage;
	}
	
    @OnOpen
    public void onOpen(Session session) throws IOException {
    	LOG.info("User connected");
        session.getBasicRemote().sendText("Ok, you are connected");
    }

    @OnMessage
    public void onMessage(Session session, String message, boolean last) throws IOException {
    	LOG.info("Got message: " + message);
    	
    	JSONObject data = null;
    	String type = null;
    	String id = null;
    	
    	try {
    		data = new JSONObject(message);
    		id = data.getString("ID");
    		type = data.getString("TYPE");
			LOG.info("Id: " + id);
		} catch (JSONException e) {
			LOG.error("Error parsing JSON " + e.getMessage());
		}
    	
    	switch (type) {
    	case "Login": {
    		LOG.info("User logged in as " + id);
    		if (users.containsKey(id)) {
    			session.getBasicRemote().sendText(LOGIN_FAIL_MESSAGE.toString(), last);
    		}
    		else {
    			users.put(id, session);
    			session.getBasicRemote().sendText(LOGIN_SUCCESS_MESSAGE.toString(), last);
    		}
    		break;
    	}
    	default:
    		session.getBasicRemote().sendText(
    				"{ \"TYPE\" : \"Error\", \"Message\" : \"Unrecognized command:" + type +  "\"}", last
    		);
    	}
    }

    @OnError
    public void onError(Throwable t) {
    	LOG.error("Error " + t.getMessage());
    }

    @OnClose
    public void onClose(Session session) {
    	LOG.info("User disconnected");
    }
}
