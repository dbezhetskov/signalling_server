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

@ServerEndpoint(value = "/ws")
public class SignalServer {
	
	private static final Logger LOG = Red5LoggerFactory.getLogger(SignalServer.class, "signalling");
	private static final JSONObject LOGIN_SUCCESS_MESSAGE;
	private static final JSONObject LOGIN_FAIL_MESSAGE;
	
	private static final HashMap<String, Session> users = new HashMap<String, Session>();
	
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
	
	private String otherName;
	private String name;
	private Session session;
	
    @OnOpen
    public void onOpen(Session session) throws IOException {
    	this.session = session;
        session.getBasicRemote().sendText("Ok, you are connected");
        LOG.info("User connected");
    }

    @OnMessage
    public void onMessage(String message) throws IOException {
    	LOG.info("Got message: " + message);
    	
    	JSONObject data = null;
    	String type = null;
    	
    	try {
    		data = new JSONObject(message);
    		type = data.getString("TYPE");
		} catch (JSONException e) {
			LOG.error("Error parsing JSON " + e.getMessage());
		}
    	
    	switch (type) {
    	case "Login": {
    		String id = null;
    		
    		try {
				id = data.getString("ID");
			} catch (JSONException e) {
				LOG.error("Error parsing JSON " + e.getMessage());
			}
    		
    		LOG.info("User logged in as " + id);
    		if (users.containsKey(id)) {
    			session.getBasicRemote().sendText(LOGIN_FAIL_MESSAGE.toString());
    		}
    		else {
    			users.put(id, session);
    			name = id;
    			session.getBasicRemote().sendText(LOGIN_SUCCESS_MESSAGE.toString());
    		}
    		break;
    	}
    	case "Offer": {
    		String targetName = null;
    		JSONObject offer = null;
    		
    		try {
    			targetName = data.getString("NAME");
    			offer = data.getJSONObject("OFFER");
			} catch (JSONException e) {
				LOG.error("Error parsing JSON " + e.getMessage());
			}
    		
    		Session targetSession = users.get(targetName);    		
    		if (targetSession != null) {
    			LOG.info("Sending offer to: " + targetName);
    			otherName = targetName;
        		
        		targetSession.getBasicRemote().sendText(
        				"{ \"TYPE\" : \"OFFER\","
        				+ "\"OFFER\" : \"" + offer.toString() +  "\","
        				+ "\"NAME\" :\"" + name + "\"}"
        		);
    		}
    		else {
    			LOG.error("Target seesion is null " + targetName);
    			LOG.error(users.toString());
    		}
    		
    		break;
    	}
    	default:
    		session.getBasicRemote().sendText(
    				"{ \"TYPE\" : \"Error\", \"Message\" : \"Unrecognized command:" + type +  "\"}"
    		);
    	}
    }

    @OnError
    public void onError(Throwable t) {
    	LOG.error("Error " + t.toString(), t);
    }

    @OnClose
    public void onClose() {
    	users.remove(name);
    	LOG.info("User " + name + " disconnected");
    }
}
