package org.red5.signalling;

import java.io.IOException;

import javax.websocket.Session;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class Client {
	private static final Logger LOG = Red5LoggerFactory.getLogger(Client.class, "client");
	
	private String id;
	private Session session;
	
	public Client(String id, Session session) {
		this.setId(id);
		this.setSession(session);
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public boolean isInitialized() {
		return session != null;
	}
	
	public void send(String message) {
		try {
			session.getBasicRemote().sendText(message);
		} catch (IOException e) {
			LOG.error(e.getMessage());
		}
	}

	public void setSession(Session session) {
		this.session = session;
	}
}