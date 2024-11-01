package uk.co.mgbramwell.polling.api;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uk.co.mgbramwell.polling.exception.AlreadyVotedException;
import uk.co.mgbramwell.polling.exception.NoActivePollException;
import uk.co.mgbramwell.polling.exception.PollInactiveException;
import uk.co.mgbramwell.polling.exception.UnknownOptionException;
import uk.co.mgbramwell.polling.exception.UnkownPollException;
import uk.co.mgbramwell.polling.model.Poll;
import uk.co.mgbramwell.polling.model.Vote;
import uk.co.mgbramwell.polling.service.PollService;
import uk.co.mgbramwell.polling.service.VoteService;

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
     *
     * @param poll - The Poll to create
     * @return The saved poll
     */
    @PostMapping
    public Poll createPoll(@Valid @RequestBody Poll poll) {
        return pollService.savePoll(poll);
    }

    /**
     * Get All Polls in Pageable format to limit hits on the database to calculate Votes
     *
     * @param page        - The page to get, defaults to 0
     * @param number      - The number per page, defaults to 10
     * @param httpSession - HttpSession used to set Votes applied to Polls
     * @return ResponseEntity with List of Polls and pages Header for total pages
     */
    @GetMapping
    public ResponseEntity<List<Poll>> getPollsByPage(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int number, HttpSession httpSession) {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);
        Page<Poll> foundPage = pollService.getPollsByPage(page, number);
        List<Poll> polls = foundPage.getContent().parallelStream()
                .map(poll -> {
                    poll = setVotedOption(poll, sessionVotes);
                    try {
                        return calculateVoteTotals(poll);
                    } catch (UnkownPollException e) {
                        throw new RuntimeException(e);
                    }
                }).collect(
                        Collectors.toList());

        HttpHeaders headers = new HttpHeaders();
        headers.set("pages", Integer.toString(foundPage.getTotalPages()));
        headers.set("total", Long.toString(foundPage.getTotalElements()));

        return ResponseEntity.ok().headers(headers).body(polls);
    }

    /**
     * Get Poll by supplied ID
     *
     * @param pollId      - The Poll ID
     * @param httpSession - HttpSession used to set Vote applied to Poll
     * @return The found Poll
     * @throws UnkownPollException - The Provided Poll ID does not Exist
     */
    @GetMapping("/{pollId}")
    public Poll getPollById(@PathVariable String pollId, HttpSession httpSession) throws UnkownPollException {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);

        Poll poll = setVotedOption(pollService.getPollById(pollId), sessionVotes);
        return calculateVoteTotals(poll);
    }

    /**
     * Get the current Active Poll
     *
     * @param httpSession - HttpSession used to set Vote applied to Poll
     * @return The found Poll
     * @throws NoActivePollException - No Poll is currently Active
     * @throws UnkownPollException   - Not Used, Poll will always exist if Active
     */
    @GetMapping("/active")
    public Poll getActivePoll(HttpSession httpSession) throws NoActivePollException, UnkownPollException {
        Map<String, String> sessionVotes = getSessionVotes(httpSession);

        Poll poll = setVotedOption(pollService.getActivePoll(), sessionVotes);
        return calculateVoteTotals(poll);
    }

    /**
     * Get the Votes submitted for a Specified Poll
     *
     * @param page   - The page to get, defaults to 0
     * @param number - The number per page, defaults to 10
     * @param pollId - The Poll ID
     * @return List of Votes for the Poll
     * @throws UnkownPollException - The Provided Poll ID does not Exist
     */
    @GetMapping("/{pollId}/vote")
    public ResponseEntity<List<Vote>> getVotesForPoll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int number, @PathVariable String pollId) throws UnkownPollException {
        Page<Vote> foundPage = voteService.getVotesByPollId(pollId, page, number);

        HttpHeaders headers = new HttpHeaders();
        headers.set("pages", Integer.toString(foundPage.getTotalPages()));
        headers.set("total", Long.toString(foundPage.getTotalElements()));

        return ResponseEntity.ok().headers(headers).body(foundPage.getContent());
    }

    /**
     * Place a Vote on a specified Poll
     *
     * @param pollId      - The Poll to Vote on
     * @param vote        - The Vote submitted
     * @param httpSession - HttpSession used to check for existing Votes for the Session
     * @return The saved Vote
     * @throws UnknownOptionException - The Option provided in the Vote does not exist on the Poll
     * @throws UnkownPollException    - The specified Poll does not exist
     * @throws PollInactiveException  - The specified Poll is not the Active Poll
     * @throws AlreadyVotedException  - The Session has already Voted on this Poll
     */
    @PutMapping("/{pollId}/vote")
    public Vote vote(@PathVariable String pollId, @Valid @RequestBody Vote vote, HttpSession httpSession) throws UnknownOptionException, UnkownPollException, PollInactiveException, AlreadyVotedException {
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
     *
     * @param pollId - The Poll to delete
     * @return Response Entity of OK if Deleted
     * @throws UnkownPollException - The specified Poll does not exist
     */
    @DeleteMapping("/{pollId}")
    public ResponseEntity<Void> deletePollById(@PathVariable String pollId) throws UnkownPollException {
        pollService.deletePoll(pollId);
        voteService.deleteByPollId(pollId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private Poll calculateVoteTotals(Poll poll) throws UnkownPollException {
        poll.setOptions(voteService.countVotesByOptions(poll.getId()));
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