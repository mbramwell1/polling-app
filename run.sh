cd polling-api
echo "Building API"
./mvnw clean package -q
echo "Moving Dependencies to speed up build times"
mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)
echo "Building Docker Image"
docker build -t mgbramwell/polling:0-SNAPSHOT .

cd ../
echo "Starting API Services"
docker compose up -d


cd polling-ui
echo "Starting UI"
ng serve