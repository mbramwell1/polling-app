package co.uk.mgbramwell.polling.service;

import co.uk.mgbramwell.polling.api.PollController;
import co.uk.mgbramwell.polling.data.PollRepository;
import co.uk.mgbramwell.polling.exception.NoActivePollException;
import co.uk.mgbramwell.polling.exception.UnkownPollException;
import co.uk.mgbramwell.polling.model.Poll;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PollService {
    private static final Logger LOG = LoggerFactory.getLogger(PollService.class);

    private final PollRepository pollRepository;

    @Autowired
    public PollService(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    public Poll savePoll(Poll poll) {
        try {
            Poll currentActive = getActivePoll();
            currentActive.setActive(false);
            pollRepository.save(currentActive);
        } catch (NoActivePollException e) {
            LOG.debug("No active Poll found when creating new Poll");
        }

        poll.setActive(true);
        return pollRepository.save(poll);
    }

    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    public Poll getPollById(String id) throws UnkownPollException {
        Optional<Poll> pollOptional = pollRepository.findById(id);
        if (pollOptional.isEmpty()) {
            throw new UnkownPollException(id);
        }

        return pollOptional.get();
    }

    public Poll getActivePoll() throws NoActivePollException {
        Optional<Poll> pollOptional = pollRepository.findOne(Example.of(Poll.builder().isActive(true).build()));
        if (pollOptional.isEmpty()) {
            throw new NoActivePollException();
        }

        return pollOptional.get();
    }

    public void deletePoll(String pollId) throws UnkownPollException {
        Poll poll = getPollById(pollId);
        pollRepository.delete(poll);
    }
}
