package uk.co.mgbramwell.polling.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Vote {
    @Id
    private String id;

    @JsonIgnore
    private String sessionId;

    @NotNull
    private String pollId;

    @NotNull
    private String choice;

    @CreatedDate
    private LocalDateTime dateCreated;
}
