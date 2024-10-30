package co.uk.mgbramwell.polling.api;

import co.uk.mgbramwell.polling.exception.AlreadyVotedException;
import co.uk.mgbramwell.polling.exception.NoActivePollException;
import co.uk.mgbramwell.polling.exception.PollInactiveException;
import co.uk.mgbramwell.polling.exception.UnknownOptionException;
import co.uk.mgbramwell.polling.exception.UnkownPollException;
import co.uk.mgbramwell.polling.model.Poll;
import co.uk.mgbramwell.polling.model.Vote;
import co.uk.mgbramwell.polling.service.PollService;
import co.uk.mgbramwell.polling.service.VoteService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/poll")
public class PollController {

    private static final Logger LOG = LoggerFactory.getLogger(PollController.class);

    private final PollService pollService;
    private final VoteService voteService;

    @Autowired
    public PollController(PollService pollService, VoteService voteService) {
        this.pollService = pollService;
        this.voteService = voteService;
    }

    /**
     * Create the supplied Poll
     * @param poll - The Poll to create
     * @return The saved poll
     */
    @PostMapping
    public Poll createPoll(@Valid @RequestBody Poll poll) {
        return pollService.savePoll(poll);
    }

    /**
     * Get All Polls
     * @param httpSession - HttpSession used to set Votes applied to Polls
     * @return The List of all Polls
     */
    @GetMapping
    public List<Poll> getAllPolls(HttpSession httpSession) {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);
        return pollService.getAllPolls()
                .parallelStream()
                .map(poll -> setVotedOption(poll, sessionVotes)).collect(
                        Collectors.toList());
    }

    /**
     * Get Poll by supplied ID
     * @param pollId - The Poll ID
     * @param httpSession - HttpSession used to set Vote applied to Poll
     * @return The found Poll
     * @throws UnkownPollException - The Provided Poll ID does not Exist
     */
    @GetMapping("/{pollId}")
    public Poll getPollById(@PathVariable("pollId") String pollId, HttpSession httpSession) throws UnkownPollException {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);

        Poll poll = setVotedOption(pollService.getPollById(pollId), sessionVotes);
        return calculateVoteTotals(poll);
    }

    /**
     * Get the current Active Poll
     * @param httpSession - HttpSession used to set Vote applied to Poll
     * @return The found Poll
     * @throws NoActivePollException - No Poll is currently Active
     * @throws UnkownPollException - Not Used, Poll will always exist if Active
     */
    @GetMapping("/active")
    public Poll getActivePoll(HttpSession httpSession) throws NoActivePollException, UnkownPollException {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);

        Poll poll = setVotedOption(pollService.getActivePoll(), sessionVotes);
        return calculateVoteTotals(poll);
    }

    /**
     * Get the Votes submitted for the current Active Poll
     * @return List of Votes for the Poll
     * @throws NoActivePollException - No Poll is currently Active
     * @throws UnkownPollException - Not Used, Poll will always exist if Active
     */
    @GetMapping("/active/vote")
    public List<Vote> getVotesForActivePoll() throws NoActivePollException, UnkownPollException {
        Poll poll = pollService.getActivePoll();
        return voteService.getVotesByPollId(poll.getId());
    }

    /**
     * Get the Votes submitted for a Specified Poll
     * @param id - The Poll ID
     * @return List of Votes for the Poll
     * @throws UnkownPollException - The Provided Poll ID does not Exist
     */
    @GetMapping("/{pollId}/vote")
    public List<Vote> getVotesForPoll(@PathVariable("pollId") String id) throws UnkownPollException {
        return voteService.getVotesByPollId(id);
    }

    /**
     * Place a Vote on a specified Poll
     * @param pollId - The Poll to Vote on
     * @param vote - The Vote submitted
     * @param httpSession - HttpSession used to check for existing Votes for the Session
     * @return The saved Vote
     * @throws UnknownOptionException - The Option provided in the Vote does not exist on the Poll
     * @throws UnkownPollException - The specified Poll does not exist
     * @throws PollInactiveException - The specified Poll is not the Active Poll
     * @throws AlreadyVotedException - The Session has already Voted on this Poll
     */
    @PutMapping("/{pollId}/vote")
    public Vote vote(@PathVariable("pollId") String pollId, @Valid @RequestBody Vote vote, HttpSession httpSession) throws UnknownOptionException, UnkownPollException, PollInactiveException, AlreadyVotedException {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);
        if (sessionVotes != null && sessionVotes.containsKey(pollId)) {
            LOG.debug("Vote: {} found for Poll ID: {} on Session: {}", sessionVotes.get(pollId), pollId,
                    httpSession.getId());
            throw new AlreadyVotedException(pollId, sessionVotes.get(pollId));
        } else {
            LOG.debug("New Vote: {} for Poll ID: {} on Session: {}", vote.getChoice(), pollId,
                    httpSession.getId());
            Vote savedVote = voteService.saveVote(httpSession.getId(), vote);
            sessionVotes.put(pollId, vote.getChoice());
            httpSession.setAttribute("votes", sessionVotes);
            return savedVote;
        }
    }

    /**
     * Delete a Poll by ID
     * @param pollId - The Poll to delete
     * @return Response Entity of OK if Deleted
     * @throws UnkownPollException - The specified Poll does not exist
     */
    @DeleteMapping("/{pollId}")
    public ResponseEntity<Void> deletePollById(@PathVariable("pollId") String pollId) throws UnkownPollException {
        pollService.deletePoll(pollId);
        voteService.deleteByPollId(pollId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private Poll calculateVoteTotals(Poll poll) throws UnkownPollException {
        List<Vote> votes = voteService.getVotesByPollId(poll.getId());
        votes.parallelStream().collect(Collectors.groupingBy(Vote::getChoice))
                .forEach((option, filteredVotes) -> poll.addVotes(option, filteredVotes.size()));
        return poll;
    }

    private Map<String, String> getSessionVotes(HttpSession httpSession) {
        return (Map<String, String>) Objects.requireNonNullElseGet(httpSession.getAttribute("votes"), HashMap::new);
    }

    private Poll setVotedOption(Poll poll, Map<String, String> votes) {
        if (votes != null) {
            poll.setVotePlaced(votes.get(poll.getId()));
        }
        return poll;
    }
}