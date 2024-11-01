package uk.co.mgbramwell.polling.api;

import com.redis.testcontainers.RedisContainer;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import uk.co.mgbramwell.polling.Application;
import uk.co.mgbramwell.polling.data.PollRepository;
import uk.co.mgbramwell.polling.data.VoteRepository;
import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.model.Vote;

import java.util.Map;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@Testcontainers
@SpringBootTest(classes = Application.class, webEnvironment = RANDOM_PORT)
public class PollControllerTest {
    private static final Map<String, Integer> OPTION_SET_1 =
            Map.of("Lewis Hamilton", 0, "Lance Stroll", 0, "Max Verstappen", 0, "Fernando Alonso", 0);
    private static final Map<String, Integer> OPTION_SET_2 =
            Map.of("Bolton Wanderers", 0, "Preston North End", 0, "Fulham", 0, "Chelsea", 0);
    @Container
    public static GenericContainer mongoDBContainer = new GenericContainer(DockerImageName.parse("mongo:latest"))
            .withExposedPorts(27017)
            .withEnv("MONGO_INITDB_ROOT_USERNAME", "root")
            .withEnv("MONGO_INITDB_ROOT_PASSWORD", "root")
            .withEnv("MONGO_INITDB_DATABASE", "admin");
    @Container
    public static RedisContainer redisContainer = new RedisContainer(DockerImageName.parse("redis:latest"))
            .withExposedPorts(6379);
    private static Poll POLL_1;
    private static Poll POLL_2;
    @LocalServerPort
    private Integer port;
    @Autowired
    private PollRepository pollRepository;
    @Autowired
    private VoteRepository voteRepository;

    @DynamicPropertySource
    static void containersProperties(DynamicPropertyRegistry registry) {
        mongoDBContainer.start();
        registry.add("spring.data.mongodb.host", mongoDBContainer::getHost);
        registry.add("spring.data.mongodb.port", mongoDBContainer::getFirstMappedPort);
        registry.add("spring.data.mongodb.username", () -> "root");
        registry.add("spring.data.mongodb.password", () -> "root");
        registry.add("spring.data.mongodb.database", () -> "admin");

        redisContainer.start();
        registry.add("spring.data.redis.host", redisContainer::getHost);
        registry.add("spring.data.redis.port", redisContainer::getFirstMappedPort);
    }

    @BeforeEach
    public void setUp() {
        pollRepository.deleteAll();
        voteRepository.deleteAll();
        RestAssured.port = port;
        POLL_1 = Poll.builder().name("Who's the Best Formula 1 Driver?").options(OPTION_SET_1).build();
        POLL_2 = Poll.builder().name("Who's going to win the Premier League?").options(OPTION_SET_2).build();
    }

    @Test
    public void createNewPollCreatesAndReturns() {
        given()
                .contentType(ContentType.JSON)
                .body(POLL_1)
                .when()
                .post("/poll")
                .then()
                .statusCode(200)
                .body("id", notNullValue())
                .body("name", equalTo("Who's the Best Formula 1 Driver?"))
                .body("options", equalTo(OPTION_SET_1))
                .body("active", equalTo(true));
    }

    @Test
    public void createNewPollMarksOldPollInactive() {
        String poll1Id = given()
                .contentType(ContentType.JSON)
                .body(POLL_1)
                .when()
                .post("/poll")
                .then()
                .statusCode(200)
                .body("id", notNullValue())
                .body("name", equalTo(POLL_1.getName()))
                .body("options", equalTo(OPTION_SET_1))
                .body("active", equalTo(true))
                .body("dateCreated", notNullValue())
                .extract().path("id");

        Optional<Poll> savedPoll1 = pollRepository.findById(poll1Id);
        assertThat(savedPoll1.isPresent(), equalTo(true));
        assertThat(savedPoll1.get().isActive(), equalTo(true));

        String poll2Id = given()
                .contentType(ContentType.JSON)
                .body(POLL_2)
                .when()
                .post("/poll")
                .then()
                .statusCode(200)
                .body("id", notNullValue())
                .body("name", equalTo(POLL_2.getName()))
                .body("options", equalTo(OPTION_SET_2))
                .body("active", equalTo(true))
                .body("dateCreated", notNullValue())
                .extract().path("id");

        savedPoll1 = pollRepository.findById(poll1Id);
        assertThat(savedPoll1.isPresent(), equalTo(true));
        assertThat(savedPoll1.get().isActive(), equalTo(false));

        Optional<Poll> savedPoll2 = pollRepository.findById(poll2Id);
        assertThat(savedPoll2.isPresent(), equalTo(true));
        assertThat(savedPoll2.get().isActive(), equalTo(true));
    }

    @Test
    public void getPollsByPageReturnsCorrectly() {
        POLL_1.setActive(true);
        Poll savedPoll1 = pollRepository.save(POLL_1);
        pollRepository.save(POLL_2);

        given()
                .when()
                .get("/poll?page=0&number=1")
                .then()
                .statusCode(200)
                .header("pages", equalTo("2"))
                .header("total", equalTo("2"))
                .body(".", hasSize(1))
                .body("[0].id", equalTo(savedPoll1.getId()))
                .body("[0].name", equalTo("Who's the Best Formula 1 Driver?"))
                .body("[0].options", equalTo(OPTION_SET_1))
                .body("[0].active", equalTo(true))
                .body("[0].dateCreated", notNullValue());
    }

    @Test
    public void getActivePollReturnsCorrectPoll() {
        POLL_1.setActive(true);
        Poll savedPoll = pollRepository.save(POLL_1);

        given()
                .when()
                .get("/poll/active")
                .then()
                .statusCode(200)
                .body("id", equalTo(savedPoll.getId()))
                .body("name", equalTo(savedPoll.getName()))
                .body("options", equalTo(OPTION_SET_1))
                .body("dateCreated", notNullValue());
    }

    @Test
    public void getActivePollWhenNoPollActiveReturnsNotFound() {
        pollRepository.save(POLL_1);

        given()
                .get("/poll/active")
                .then()
                .statusCode(404)
                .body("message", equalTo("No Active Poll found"))
                .body("error", equalTo("Not Found"));
    }

    @Test
    public void getPollByIdReturnsCorrectPoll() {
        Poll savedPoll = pollRepository.save(POLL_1);

        given()
                .when()
                .get("/poll/" + savedPoll.getId())
                .then()
                .statusCode(200)
                .body("id", equalTo(savedPoll.getId()))
                .body("name", equalTo(savedPoll.getName()))
                .body("options", equalTo(OPTION_SET_1))
                .body("dateCreated", notNullValue());
    }

    @Test
    public void getPollByIdCalculatesVoteTotalsCorrectly() {
        Poll savedPoll = pollRepository.save(POLL_1);

        Vote vote1 = Vote.builder()
                .sessionId("1234")
                .pollId(POLL_1.getId())
                .choice("Lewis Hamilton").build();
        Vote vote2 = Vote.builder()
                .sessionId("9876")
                .pollId(POLL_1.getId())
                .choice("Fernando Alonso").build();

        voteRepository.save(vote1);
        voteRepository.save(vote2);

        Map<String, Integer> updatedOptionSet =
                Map.of("Lewis Hamilton", 1, "Lance Stroll", 0, "Max Verstappen", 0, "Fernando Alonso", 1);

        given()
                .when()
                .get("/poll/" + savedPoll.getId())
                .then()
                .statusCode(200)
                .body("id", equalTo(savedPoll.getId()))
                .body("name", equalTo(savedPoll.getName()))
                .body("options", equalTo(updatedOptionSet))
                .body("dateCreated", notNullValue());
    }

    @Test
    public void getPollByIncorrectIdReturnsNotFound() {
        pollRepository.save(POLL_1);

        given()
                .get("/poll/NOTAVALIDID")
                .then()
                .statusCode(404)
                .body("message", equalTo("No Poll found with ID NOTAVALIDID"))
                .body("error", equalTo("Not Found"));
    }

    @Test
    public void getVotesByPollIdReturnsOk() {
        POLL_1.setActive(true);
        POLL_1 = pollRepository.save(POLL_1);
        POLL_2 = pollRepository.save(POLL_2);

        Vote voteNotToReturn1 = Vote.builder()
                .sessionId("1234")
                .pollId(POLL_1.getId())
                .choice("Lewis Hamilton").build();
        Vote voteNotToReturn2 = Vote.builder()
                .sessionId("9876")
                .pollId(POLL_1.getId())
                .choice("Fernando Alonso").build();
        Vote vote1 = Vote.builder()
                .sessionId("AAAA")
                .pollId(POLL_2.getId())
                .choice("Fulham").build();

        vote1 = voteRepository.save(vote1);
        voteRepository.save(voteNotToReturn1);
        voteRepository.save(voteNotToReturn2);

        given()
                .when()
                .get("/poll/" + POLL_2.getId() + "/vote")
                .then()
                .statusCode(200)
                .header("pages", equalTo("1"))
                .header("total", equalTo("1"))
                .body(".", hasSize(1))
                .body("[0].id", equalTo(vote1.getId()))
                .body("[0].pollId", equalTo(vote1.getPollId()))
                .body("[0].choice", equalTo(vote1.getChoice()))
                .body("[0].dateCreated", equalTo(vote1.getDateCreated().toString()));
    }

    @Test
    public void getVotesByInvalidPollIdReturnsNotFound() {
        POLL_1.setActive(true);
        POLL_1 = pollRepository.save(POLL_1);

        given()
                .when()
                .get("/poll/NOTAVALIDID/vote")
                .then()
                .statusCode(404)
                .body("message", equalTo("No Poll found with ID NOTAVALIDID"))
                .body("error", equalTo("Not Found"));
    }


    @Test
    public void voteForValidPollReturns() {
        POLL_1.setActive(true);
        POLL_1 = pollRepository.save(POLL_1);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Lewis Hamilton").build();

        given()
                .contentType(ContentType.JSON)
                .body(vote)
                .put("/poll/" + POLL_1.getId() + "/vote")
                .then()
                .statusCode(200)
                .body("id", notNullValue())
                .body("pollId", equalTo(POLL_1.getId()))
                .body("choice", equalTo("Lewis Hamilton"))
                .body("dateCreated", notNullValue());
    }

    @Test
    public void voteAgainForValidPollReturnsBadRequest() {
        POLL_1.setActive(true);
        POLL_1 = pollRepository.save(POLL_1);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Lewis Hamilton").build();

        String sessionCookie = given()
                .contentType(ContentType.JSON)
                .body(vote)
                .put("/poll/" + POLL_1.getId() + "/vote")
                .then()
                .statusCode(200)
                .body("id", notNullValue())
                .body("pollId", equalTo(POLL_1.getId()))
                .body("choice", equalTo("Lewis Hamilton"))
                .body("dateCreated", notNullValue())
                .extract().cookie("SESSION");

        Vote vote2 = Vote.builder().pollId(POLL_1.getId()).choice("Fernando Alonso").build();

        given()
                .cookie("SESSION", sessionCookie)
                .contentType(ContentType.JSON)
                .body(vote2)
                .put("/poll/" + POLL_1.getId() + "/vote")
                .then()
                .statusCode(400)
                .body("message", equalTo("Vote for Lewis Hamilton already Placed on Poll " + POLL_1.getId()))
                .body("error", equalTo("Bad Request"));
    }

    @Test
    public void voteForInvalidPollReturnsNotFound() {
        Vote vote = Vote.builder().pollId("NOTAVALIDID").choice("Lewis Hamilton").build();

        given()
                .contentType(ContentType.JSON)
                .body(vote)
                .put("/poll/NOTAVALIDID/vote")
                .then()
                .statusCode(404)
                .body("message", equalTo("No Poll found with ID NOTAVALIDID"))
                .body("error", equalTo("Not Found"));
    }

    @Test
    public void voteForInvalidOptionOnValidPollReturnsNotFound() {
        POLL_1.setActive(true);
        POLL_1 = pollRepository.save(POLL_1);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("NOTAVALIDOPTION").build();

        given()
                .contentType(ContentType.JSON)
                .body(vote)
                .put("/poll/" + POLL_1.getId() + "/vote")
                .then()
                .statusCode(404)
                .body("message", equalTo("No Option NOTAVALIDOPTION found on Poll ID " + POLL_1.getId()))
                .body("error", equalTo("Not Found"));
    }

    @Test
    public void voteForInactivePollReturnsBadRequest() {
        POLL_1 = pollRepository.save(POLL_1);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Lewis Hamilton").build();

        given()
                .contentType(ContentType.JSON)
                .body(vote)
                .put("/poll/" + POLL_1.getId() + "/vote")
                .then()
                .statusCode(400)
                .body("message", equalTo("Poll " + POLL_1.getId() + " is Not Active"))
                .body("error", equalTo("Bad Request"));
    }


    @Test
    public void deletePollByIdReturnsOk() {
        Poll savedPoll = pollRepository.save(POLL_1);

        given()
                .when()
                .delete("/poll/" + savedPoll.getId())
                .then()
                .statusCode(200);

        Optional<Poll> pollOptional = pollRepository.findById(savedPoll.getId());
        assertThat(pollOptional.isPresent(), equalTo(false));
    }

    @Test
    public void testDeleteByInvalidPollIdReturnsNotFound() {
        pollRepository.save(POLL_1);

        given()
                .when()
                .delete("/poll/NOTAVALIDID")
                .then()
                .statusCode(404);
    }


}