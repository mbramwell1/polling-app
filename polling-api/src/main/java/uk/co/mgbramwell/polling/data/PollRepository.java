package uk.co.mgbramwell.polling.data;

import uk.co.mgbramwell.polling.model.Poll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PollRepository extends MongoRepository<Poll, String> {
}