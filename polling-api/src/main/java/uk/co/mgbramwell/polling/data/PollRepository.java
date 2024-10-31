package uk.co.mgbramwell.polling.data;

import org.springframework.data.mongodb.repository.MongoRepository;
import uk.co.mgbramwell.polling.model.Poll;

public interface PollRepository extends MongoRepository<Poll, String> {
}