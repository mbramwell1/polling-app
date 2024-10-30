package co.uk.mgbramwell.polling.service;

import co.uk.mgbramwell.polling.Application;
import co.uk.mgbramwell.polling.data.PollRepository;
import co.uk.mgbramwell.polling.data.VoteRepository;
import co.uk.mgbramwell.polling.exception.NoVoteForSessionException;
import co.uk.mgbramwell.polling.exception.PollInactiveException;
import co.uk.mgbramwell.polling.exception.UnknownOptionException;
import co.uk.mgbramwell.polling.exception.UnkownPollException;
import co.uk.mgbramwell.polling.model.Poll;
import co.uk.mgbramwell.polling.model.Vote;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest(classes = Application.class)
public class VoteServiceTest {
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
    private static Poll POLL_1;
    private static Poll POLL_2;

    private static String SESSION_UUID;
    @Autowired
    private VoteRepository voteRepository;
    @Autowired
    private PollRepository pollRepository;
    @Autowired
    private VoteService voteService;

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
        voteRepository.deleteAll();
        POLL_1 = Poll.builder().name("Who's the Best Formula 1 Driver?").options(OPTION_SET_1).isActive(true).build();
        POLL_1 = pollRepository.save(POLL_1);
        POLL_2 = Poll.builder().name("Who's going to win the Premier League?").options(OPTION_SET_2).build();
        POLL_2 = pollRepository.save(POLL_2);
        SESSION_UUID = UUID.randomUUID().toString();
    }

    @Test
    public void saveVoteSavesCorrectly() throws UnkownPollException, UnknownOptionException, PollInactiveException {
        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Fernando Alonso").build();
        assertThat(vote.getId(), is(nullValue()));

        vote = voteService.saveVote(SESSION_UUID, vote);
        assertThat(vote.getId(), is(notNullValue()));
    }

    @Test
    public void saveVoteForInvalidPollThrowsException() {
        Vote vote = Vote.builder().pollId("NotAValidId").choice("Fernando Alonso").build();
        assertThrows(UnkownPollException.class, () -> voteService.saveVote(SESSION_UUID, vote));
    }

    @Test
    public void saveVoteForInvalidOptionThrowsException() {
        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Not A Valid Option").build();
        assertThrows(UnknownOptionException.class, () -> voteService.saveVote(SESSION_UUID, vote));
    }

    @Test
    public void saveVoteForInactivePollThrowsException() {
        POLL_1.setActive(false);
        POLL_1 = pollRepository.save(POLL_1);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Not A Valid Option").build();
        assertThrows(PollInactiveException.class, () -> voteService.saveVote(SESSION_UUID, vote));
    }

    @Test
    public void getVotesForPollIdReturnsCorrectly() throws UnkownPollException {
        voteRepository.save(
                Vote.builder().sessionId(UUID.randomUUID().toString()).pollId(POLL_1.getId()).choice("Lance Stroll")
                        .build());
        voteRepository.save(
                Vote.builder().sessionId(UUID.randomUUID().toString()).pollId(POLL_1.getId()).choice("Lewis Hamilton")
                        .build());
        voteRepository.save(
                Vote.builder().sessionId(UUID.randomUUID().toString()).pollId(POLL_1.getId()).choice("Fernando Alonso")
                        .build());

        List<Vote> votes = voteService.getVotesByPollId(POLL_1.getId());
        assertThat(votes.size(), equalTo(3));
    }

    @Test
    public void getVotesForInvalidPollThrowsException() {
        POLL_1.setActive(false);
        POLL_1 = pollRepository.save(POLL_1);
        assertThrows(UnkownPollException.class, () -> voteService.getVotesByPollId("NOTAVALIDID"));
    }

    @Test
    public void getVoteBySessionReturnsCorrectly() throws NoVoteForSessionException, UnkownPollException, UnknownOptionException, PollInactiveException {
        voteRepository.save(Vote.builder().sessionId(SESSION_UUID).pollId(POLL_1.getId()).choice("Fernando Alonso").build());

        Vote vote = voteService.getVoteBySession(POLL_1.getId(), SESSION_UUID);
        assertThat(vote.getId(), is(notNullValue()));
        assertThat(vote.getChoice(), equalTo("Fernando Alonso"));
    }

    @Test
    public void getVoteBySessionIdNonExistingThrowsException() throws UnkownPollException, UnknownOptionException, PollInactiveException {
        voteRepository.save(Vote.builder().sessionId(SESSION_UUID).pollId(POLL_1.getId()).choice("Fernando Alonso").build());
        assertThrows(NoVoteForSessionException.class,
                () -> voteService.getVoteBySession(POLL_1.getId(), "NOTASESSIONID"));
    }

    @Test
    public void deleteByPollIdDeletesCorrectly() throws UnkownPollException {
        voteRepository.save(Vote.builder().sessionId(SESSION_UUID).pollId(POLL_1.getId()).choice("Fernando Alonso").build());
        voteRepository.save(Vote.builder().sessionId(SESSION_UUID).pollId(POLL_2.getId()).choice("Fulham").build());

        List<Vote> poll1Votes = voteService.getVotesByPollId(POLL_1.getId());
        assertThat(poll1Votes.size(), equalTo(1));

        List<Vote> poll2Votes = voteService.getVotesByPollId(POLL_2.getId());
        assertThat(poll2Votes.size(), equalTo(1));

        voteService.deleteByPollId(POLL_1.getId());

        poll1Votes = voteService.getVotesByPollId(POLL_1.getId());
        assertThat(poll1Votes.size(), equalTo(0));

        poll2Votes = voteService.getVotesByPollId(POLL_2.getId());
        assertThat(poll2Votes.size(), equalTo(1));
    }
}
