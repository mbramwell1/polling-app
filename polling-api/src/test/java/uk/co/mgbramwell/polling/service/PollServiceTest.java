package uk.co.mgbramwell.polling.service;

import uk.co.mgbramwell.polling.Application;
import uk.co.mgbramwell.polling.data.PollRepository;
import uk.co.mgbramwell.polling.exception.NoActivePollException;
import uk.co.mgbramwell.polling.exception.UnkownPollException;
import uk.co.mgbramwell.polling.model.Poll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import uk.co.mgbramwell.polling.service.PollService;

import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.samePropertyValuesAs;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest(classes = Application.class)
public class PollServiceTest {

    private static final Map<String, Integer> OPTION_SET_1 =
            Map.of("Lewis Hamilton", 0, "Lance Stroll", 0, "Max Verstappen", 0, "Fernando Alonso", 0);
    private static final Map<String, Integer> OPTION_SET_2 =
            Map.of("Bolton Wanderers", 0, "Preston North End", 0, "Fulham", 0, "Chelsea", 0);

    private static Poll POLL_1;
    private static Poll POLL_2;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollService pollService;

    @Container
    public static GenericContainer mongoDBContainer = new GenericContainer(DockerImageName.parse("mongo:latest"))
            .withExposedPorts(27017)
            .withEnv("MONGO_INITDB_ROOT_USERNAME", "root")
            .withEnv("MONGO_INITDB_ROOT_PASSWORD", "root")
            .withEnv("MONGO_INITDB_DATABASE", "admin");

    @DynamicPropertySource
    static void containersProperties(DynamicPropertyRegistry registry) {
        mongoDBContainer.start();
        registry.add("spring.data.mongodb.host", mongoDBContainer::getHost);
        registry.add("spring.data.mongodb.port", mongoDBContainer::getFirstMappedPort);
        registry.add("spring.data.mongodb.username", () -> "root");
        registry.add("spring.data.mongodb.password", () -> "root");
        registry.add("spring.data.mongodb.database", () -> "admin");
    }

    @BeforeEach
    public void setup() {
        pollRepository.deleteAll();
        POLL_1 = Poll.builder().name("Who's the Best Formula 1 Driver?").options(OPTION_SET_1).build();
        POLL_2 = Poll.builder().name("Who's going to win the Premier League?").options(OPTION_SET_2).build();
    }

    @Test
    public void savePollSavesCorrectly() {
        assertThat(POLL_1.getId(), is(nullValue()));

        Poll savedPoll = pollRepository.save(POLL_1);
        assertThat(savedPoll.getId(), is(notNullValue()));
    }

    @Test
    public void getAllPollsReturnsAll() {
        Poll savedPoll1 = pollRepository.save(POLL_1);
        Poll savedPoll2 = pollRepository.save(POLL_2);

        List<Poll> pollList = pollService.getAllPolls();
        assertThat(pollList.size(), equalTo(2));
        assertThat(pollList.getFirst(), samePropertyValuesAs(savedPoll1));
        assertThat(pollList.get(1), samePropertyValuesAs(savedPoll2));
    }

    @Test
    public void getActivePollReturnsCorrectPoll() throws NoActivePollException {
        POLL_1.setActive(true);

        Poll savedPoll1 = pollRepository.save(POLL_1);
        pollRepository.save(POLL_2);

        Poll activePoll = pollService.getActivePoll();
        assertThat(activePoll.isActive(), equalTo(true));
        assertThat(activePoll, samePropertyValuesAs(savedPoll1));
    }

    @Test
    public void getActivePollWhenNoPollActiveThrowsException() {
        pollRepository.save(POLL_1);

        assertThrows(NoActivePollException.class, () -> pollService.getActivePoll());
    }

    @Test
    public void getPollByIdReturnsCorrectPoll() throws UnkownPollException {
        Poll savedPoll1 = pollRepository.save(POLL_1);
        pollRepository.save(POLL_2);

        Poll activePoll = pollService.getPollById(savedPoll1.getId());
        assertThat(activePoll, samePropertyValuesAs(savedPoll1));
    }

    @Test
    public void getPollByIncorrectIdThrowsException() {
        assertThrows(UnkownPollException.class, () -> pollService.getPollById("NotAValidId"));
    }

    @Test
    public void deletePollDeletesCorrectly() throws UnkownPollException {
        Poll savedPoll1 = pollRepository.save(POLL_1);
        pollRepository.save(POLL_2);

        List<Poll> pollList = pollService.getAllPolls();
        assertThat(pollList.size(), equalTo(2));

        pollService.deletePoll(savedPoll1.getId());

        pollList = pollService.getAllPolls();
        assertThat(pollList.size(), equalTo(1));

        final String poll1Id = savedPoll1.getId();
        assertThrows(UnkownPollException.class, () -> pollService.getPollById(poll1Id));
    }

    @Test
    public void deletePollWithIncorrectIdThrowsException() {
        assertThrows(UnkownPollException.class, () -> pollService.deletePoll("NotAValidId"));
    }
}
