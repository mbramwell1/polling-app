package uk.co.mgbramwell.polling.data;

import uk.co.mgbramwell.polling.model.Vote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends MongoRepository<Vote, String> {
    void deleteByPollId(String pollId);
}