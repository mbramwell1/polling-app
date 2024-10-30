package uk.co.mgbramwell.polling.demoutils;

import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.service.PollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Class used for Demo purposes to load a Poll into the Database on startup.
 */
@Component
public class DemoDataLoader implements ApplicationRunner {

    private static final Map<String, Integer> OPTION_SET_1 =
            Map.of("Lewis Hamilton", 0, "Lance Stroll", 0, "Max Verstappen", 0, "Fernando Alonso", 0);

    private final PollService pollService;

    @Autowired
    public DemoDataLoader(PollService pollService) {
        this.pollService = pollService;
    }

    public void run(ApplicationArguments args) {
        Poll demoPoll = Poll.builder().id("672113d883050c4f96b654f1").name("Who's the Best Formula 1 Driver?")
                .options(OPTION_SET_1).build();
        pollService.savePoll(demoPoll);
    }
}