Signalling server
================

Red5 signalling server application.

It will be merged with apache OpenMeetings server later. 

Build the application from the command line with

```bash
mvn package
```

Deploy your application by:

copying the war file into your <i>red5/webapps</i> directory

and copy tomcat-embed-websocket-8.0.33.jar into your red5-server/plugins/ directory. 

After deploy is complete, go to http://localhost:5080/signalling/ in your browser.