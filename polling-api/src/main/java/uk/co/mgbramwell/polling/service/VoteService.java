package uk.co.mgbramwell.polling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import uk.co.mgbramwell.polling.api.websocket.WebSocketMessagePublisher;
import uk.co.mgbramwell.polling.data.VoteRepository;
import uk.co.mgbramwell.polling.exception.NoVoteForSessionException;
import uk.co.mgbramwell.polling.exception.PollInactiveException;
import uk.co.mgbramwell.polling.exception.UnknownOptionException;
import uk.co.mgbramwell.polling.exception.UnkownPollException;
import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.model.Vote;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class VoteService {
    private final PollService pollService;
    private final WebSocketMessagePublisher publisher;
    private final VoteRepository voteRepository;

    @Autowired
    public VoteService(VoteRepository voteRepository, PollService pollService, WebSocketMessagePublisher publisher) {
        this.voteRepository = voteRepository;
        this.pollService = pollService;
        this.publisher = publisher;
    }

    public Vote getVoteBySession(String pollId, String sessionId) throws NoVoteForSessionException {
        Optional<Vote> vote =
                voteRepository.findOne(Example.of(Vote.builder().sessionId(sessionId).pollId(pollId).build()));

        if (vote.isPresent()) {
            return vote.get();
        } else {
            throw new NoVoteForSessionException(pollId, sessionId);
        }
    }

    public Page<Vote> getVotesByPollId(String pollId, int page, int number) throws UnkownPollException {
        Poll poll = pollService.getPollById(pollId);

        return voteRepository.findAll(Example.of(Vote.builder().pollId(poll.getId()).build()),
                PageRequest.of(page, number, Sort.by("dateCreated").descending()));
    }

    public Map<String, Integer> countVotesByOptions(String pollId) throws UnkownPollException {
        Poll poll = pollService.getPollById(pollId);

        return poll.getOptions().keySet().parallelStream().map(key -> {
            long documentCount =
                    voteRepository.count(Example.of(Vote.builder().pollId(poll.getId()).choice(key).build()));
            return Map.entry(key, (int) documentCount);
        }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public Vote saveVote(String sessionId, Vote vote) throws UnkownPollException, UnknownOptionException, PollInactiveException {
        Poll poll = pollService.getPollById(vote.getPollId());

        if (poll.isActive()) {
            if (poll.hasOption(vote.getChoice())) {
                vote.setSessionId(sessionId);
                Vote savedVote = voteRepository.save(vote);
                publisher.handleVoteMessage(savedVote.getChoice());
                return savedVote;
            } else {
                throw new UnknownOptionException(poll.getId(), vote.getChoice());
            }
        } else {
            throw new PollInactiveException(poll.getId());
        }
    }

    public void deleteByPollId(String pollId) {
        voteRepository.deleteByPollId(pollId);
    }
}
