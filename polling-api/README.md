# mbramwell-dizplai-test API

This is the API submission for the Technical Test for Martin Bramwell.
The submission uses the Spring Boot framework, along with RestAssured and TestContainers for testing.

## Running the application via the Maven Wrapper

The API needs a Mongo and Redis instance available. The easiest way to get started is to use the Spring Boot tools and Docker compose.
Running via the CLI will start up Mongo and Redis in a Docker Container.

You will need Java21, Docker and Docker Compose installed.
Maven has been provided as part of the project in the Maven Wrapper.

```shell script
./mvnw spring-boot:run
```

## Running the application in Docker

Build a Docker image:
```shell script
./mvnw spring-boot:build-image
```

Or you can build a Native Docker image, but this will be resource intensive:
```shell script
./mvnw spring-boot:build-image -Pnative
```

Finally:
```shell script
docker compose up
```

## Using the Application

The Application provides several Endpoints, as well as a WebSocket to listen for new Votes on a given Poll.
JavaDocs are available in
[PollController.java](src/main/java/uk/co/mgbramwell/polling/api/PollController.java) and 
[WebSocketController.java](src/main/java/uk/co/mgbramwell/polling/api/websocket/WebSocketController.java).

Demo Polls will be loaded when the application first starts up by an ApplicationRunner
[DemoDataLoader.java](src/main/java/uk/co/mgbramwell/polling/demoutils/DemoDataLoader.java). This will increase startup time on first Launch. This can be disabled by setting Property
value `demo.loadData=false`.

Swagger is also included by default and once the Dev Mode Application is running, visit:
[localhost:8080/swagger-ui/index.html](localhost:8080/swagger-ui/index.html). This will give you a graphical, interactive way to use
the API.

## Contributing
The [code-style.xml](code-style.xml) Code Style file included in this Repo is for IntelliJ IDEA.
Please import this code style when contributing as although close to the default IntelliJ style, it is slightly different.