package uk.co.mgbramwell.polling.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Vote {
    @Id
    private String id;
    @JsonIgnore
    private String sessionId;
    @NotNull
    private String pollId;
    @NotNull
    private String choice;
    private String timestamp;
}
