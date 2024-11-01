package uk.co.mgbramwell.polling.demoutils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import uk.co.mgbramwell.polling.data.PollRepository;
import uk.co.mgbramwell.polling.data.VoteRepository;
import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.model.Vote;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Class used for Demo purposes to load a Poll into the Database on startup.
 * This will increase startup time on first launch to introduce time differences to the Polls.
 * To disable, set Property value demo.loadData to false
 */
@Component
public class DemoDataLoader implements ApplicationRunner {

    private static final Map<String, Integer> OPTION_SET_1 =
            Map.of("Arizona Cardinals", 0, "Buffalo Bills", 0, "Atlanta Falcons", 0, "Cleveland Browns", 0);

    private static final Map<String, Integer> OPTION_SET_2 =
            Map.of("Preston North End", 0, "Bolton Wanderers", 0, "Fulham", 0, "Chelsea", 0);

    private static final Map<String, Integer> OPTION_SET_3 =
            Map.of("Silverstone", 0, "Monza", 0, "Spa", 0, "Interlagos", 0);

    private static final Map<String, Integer> OPTION_SET_4 =
            Map.of("Tiger Woods", 0, "Rory Mcllroy", 0, "Justin Rose", 0, "Denny McCarthy", 0);

    private static final Map<String, Integer> OPTION_SET_5 =
            Map.of("Ferrari", 0, "Mclaren", 0, "Red Bull", 0, "Aston Martin", 0);

    private static final Map<String, Integer> OPTION_SET_6 =
            Map.of("Manchester United", 0, "Manchester City", 0, "Liverpool", 0, "Everton", 0);

    private static final Map<String, Integer> OPTION_SET_7 =
            Map.of("Fulham", 0, "Arsenal", 0, "Chelsea", 0, "West Ham", 0);

    private static final Map<String, Integer> OPTION_SET_8 =
            Map.of("Novak Djokovic", 0, "Tim Henman", 0, "Andy Murray", 0, "Roger Federer", 0);

    private static final Map<String, Integer> OPTION_SET_9 =
            Map.of("Lewis Hamilton", 0, "Lance Stroll", 0, "Max Verstappen", 0, "Fernando Alonso", 0);
    private final PollRepository pollRepository;
    private final VoteRepository voteRepository;
    private boolean loadData = false;

    @Autowired
    public DemoDataLoader(@Value("${demo.loadData}") boolean loadData, PollRepository pollRepository, VoteRepository voteRepository) {
        this.pollRepository = pollRepository;
        this.voteRepository = voteRepository;
        this.loadData = loadData;
    }

    public void run(ApplicationArguments args) throws InterruptedException {
        if (loadData && pollRepository.findAll().isEmpty()) {
            createNewPoll("Who's the best NFL Team?", false, OPTION_SET_1);
            Thread.sleep(1000);
            createNewPoll("Who's going to win the Premier League?", false, OPTION_SET_2);
            Thread.sleep(1000);
            createNewPoll("What is the best F1 Track?", false, OPTION_SET_3);
            Thread.sleep(1000);
            createNewPoll("Who's the best Golfer?", false, OPTION_SET_4);
            Thread.sleep(1000);
            createNewPoll("What is the best F1 Team?", false, OPTION_SET_5);
            Thread.sleep(1000);
            createNewPoll("What is the best Football Team?", false, OPTION_SET_6);
            Thread.sleep(1000);
            createNewPoll("What is the best London Football Team?", false, OPTION_SET_7);
            Thread.sleep(1000);
            createNewPoll("Who's the best Tennis Player?", false, OPTION_SET_8);
            Thread.sleep(1000);
            createNewPoll("Who's the Best Formula 1 Driver?", true, OPTION_SET_9);
        }
    }

    private void createNewPoll(String pollText, boolean active, Map<String, Integer> options) {
        Poll demoPoll = Poll.builder()
                .name(pollText)
                .dateCreated(LocalDateTime.now())
                .isActive(active)
                .options(options).build();
        pollRepository.save(demoPoll);
        voteRepository.saveAll(generateVote(demoPoll.getId(), demoPoll.getOptions()));
    }

    private List<Vote> generateVote(String pollId, Map<String, Integer> options) {
        Random generator = new Random();
        int numVotes = generator.nextInt(100);
        String[] keys = options.keySet().toArray(new String[0]);
        List<Vote> votes = new ArrayList<>();
        for (int i = 0; i < numVotes; i++) {
            String randomVote = keys[generator.nextInt(keys.length)];
            votes.add(Vote.builder().pollId(pollId).choice(randomVote).dateCreated(LocalDateTime.now())
                    .sessionId(UUID.randomUUID().toString()).build());
        }
        return votes;
    }
}