# mbramwell-dizplai-test

This is the submission for the Technical Test for Martin Bramwell.

## Structure
The application is made up of an API built in Java and Spring Boot and a UI built using Angular.

## Running the Application
Both the UI and API can be run independently and instructions can be found in their respective README files.

However the best experience will be running the applications together. To do so there is a Bash script in this repository
that will build API and start it in Docker, along with starting up the Angular UI:

```shell script
bash run.sh
```

The Docker Compose file in this directory applies to the API only. The UI will be using a standard 'ng serve'.

## Using the Application
Open your browser and navigate to http://localhost:4200 for the UI.
To interact with the API read the [API README](polling-api/README.md).

## Cleaning Up
'ng serve' will be attached whilst running the UI. Use CTRL + C to exit.
Finally:
```shell script
docker compose down
```
