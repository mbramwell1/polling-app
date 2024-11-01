package uk.co.mgbramwell.polling.api;

import com.redis.testcontainers.RedisContainer;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import uk.co.mgbramwell.polling.Application;
import uk.co.mgbramwell.polling.data.PollRepository;
import uk.co.mgbramwell.polling.data.VoteRepository;
import uk.co.mgbramwell.polling.exception.PollInactiveException;
import uk.co.mgbramwell.polling.exception.UnknownOptionException;
import uk.co.mgbramwell.polling.exception.UnkownPollException;
import uk.co.mgbramwell.polling.model.NewPollMessage;
import uk.co.mgbramwell.polling.model.NewVoteMessage;
import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.model.Vote;
import uk.co.mgbramwell.polling.service.PollService;
import uk.co.mgbramwell.polling.service.VoteService;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeoutException;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@Testcontainers
@SpringBootTest(classes = Application.class, webEnvironment = RANDOM_PORT)
public class WebSocketControllerTest {

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
    @Autowired
    private VoteService voteService;
    @Autowired
    private PollService pollService;
    private WebSocketStompClient stompClient;

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

        POLL_1 = Poll.builder().name("Who's the Best Formula 1 Driver?").options(OPTION_SET_1).isActive(true).build();
        POLL_2 = Poll.builder().name("Who's going to win the Premier League?").options(OPTION_SET_2).build();

        POLL_1 = pollRepository.save(POLL_1);

        WebSocketClient webSocketClient = new StandardWebSocketClient();
        stompClient = new WebSocketStompClient(webSocketClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    }

    @Test
    public void newVoteRegisteredSendsNewVoteMessage() throws ExecutionException, InterruptedException, TimeoutException, UnkownPollException, UnknownOptionException, PollInactiveException {
        BlockingQueue<NewVoteMessage> blockingQueue = new LinkedBlockingDeque<>();
        subscribe(blockingQueue, NewVoteMessage.class);

        Vote vote = Vote.builder().pollId(POLL_1.getId()).choice("Lewis Hamilton").build();
        voteService.saveVote("1234", vote);

        NewVoteMessage messageReceived = blockingQueue.poll(10, SECONDS);
        assertThat(messageReceived.getChoice(), equalTo("Lewis Hamilton"));
        assertThat(messageReceived.getMessage(), equalTo("newvote"));
    }

    @Test
    public void newPollCreatedSendsNewPollMessage() throws ExecutionException, InterruptedException, TimeoutException, UnkownPollException, UnknownOptionException, PollInactiveException {
        BlockingQueue<NewPollMessage> blockingQueue = new LinkedBlockingDeque<>();
        subscribe(blockingQueue, NewPollMessage.class);

        Poll savedPoll = pollService.savePoll(POLL_2);

        NewPollMessage messageReceived = blockingQueue.poll(10, SECONDS);
        assertThat(messageReceived.getPollId(), equalTo(savedPoll.getId()));
        assertThat(messageReceived.getMessage(), equalTo("newpoll"));
    }

    private void subscribe(BlockingQueue blockingQueue, Class messageClass) throws ExecutionException, InterruptedException, TimeoutException {
        stompClient.connectAsync(String.format("ws://localhost:%d/ws", port), new StompSessionHandlerAdapter() {
                }).get(30, SECONDS)
                .subscribe("/topic/votes", new StompFrameHandler() {
                    @Override public @NotNull Type getPayloadType(@NotNull StompHeaders headers) {
                        return messageClass;
                    }

                    @Override public void handleFrame(@NotNull StompHeaders headers, Object payload) {
                        System.out.println("Received Thing");
                        blockingQueue.offer(payload);
                    }
                });
    }
}