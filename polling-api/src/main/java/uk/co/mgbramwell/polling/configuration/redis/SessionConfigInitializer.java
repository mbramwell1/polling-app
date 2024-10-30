package uk.co.mgbramwell.polling.configuration.redis;

import org.springframework.session.web.context.AbstractHttpSessionApplicationInitializer;

public class SessionConfigInitializer extends AbstractHttpSessionApplicationInitializer {
    public SessionConfigInitializer() {
        super(RedisConfig.class);
    }
}