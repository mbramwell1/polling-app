package uk.co.mgbramwell.polling.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import uk.co.mgbramwell.polling.api.websocket.WebSocketMessagePublisher;
import uk.co.mgbramwell.polling.data.PollRepository;
import uk.co.mgbramwell.polling.exception.NoActivePollException;
import uk.co.mgbramwell.polling.exception.UnkownPollException;
import uk.co.mgbramwell.polling.model.Poll;

import java.util.Optional;

@Component
public class PollService {
    private static final Logger LOG = LoggerFactory.getLogger(PollService.class);

    private final PollRepository pollRepository;
    private final WebSocketMessagePublisher publisher;

    @Autowired
    public PollService(PollRepository pollRepository, WebSocketMessagePublisher publisher) {
        this.pollRepository = pollRepository;
        this.publisher = publisher;
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
        poll = pollRepository.save(poll);
        publisher.handlePollMessage(poll.getId());
        return poll;
    }

    public Page<Poll> getPollsByPage(int page, int number) {
        return pollRepository.findAll(PageRequest.of(page, number, Sort.by("dateCreated").descending()));
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
