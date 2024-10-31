package uk.co.mgbramwell.polling.model;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Poll {

    @Id
    private String id;

    @NotNull
    @Size(min = 10, max = 75)
    private String name;

    private boolean isActive;

    @NotNull
    @Size(min = 2, max = 7)
    private Map<String, Integer> options;

    @CreatedDate
    private LocalDateTime dateCreated;

    private String votePlaced;

    public boolean hasOption(String option) {
        return options.containsKey(option);
    }

    public void addVotes(String option, int votes) {
        this.options.put(option, votes);
    }
}