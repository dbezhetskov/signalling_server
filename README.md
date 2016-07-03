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

copying the json jar files into your <i>red5/lib</i> directory from here http://mvnrepository.com/artifact/org.json/json/20090211

and copy tomcat-embed-websocket-8.0.33.jar into your red5-server/plugins/ directory. 

After deploy is complete, go to http://localhost:5080/signalling/ in your browser (now stable work only for firefox).

You can open two tabs in browser and login with some names. For example you can login as Alice and Bob.

Then you can call from one tab to another. Just enter the others user name and push the call button.
