package uk.co.mgbramwell.polling.data;

import org.springframework.data.mongodb.repository.MongoRepository;
import uk.co.mgbramwell.polling.model.Vote;

public interface VoteRepository extends MongoRepository<Vote, String> {
    void deleteByPollId(String pollId);
}