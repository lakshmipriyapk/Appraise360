package com.example.springapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile({"default"})
public class DatabaseCleanupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseCleanupRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCleanupRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Drop legacy singular-named tables if they still exist
        // Disable foreign key checks during cleanup to avoid dependency errors
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
        } catch (Exception ex) {
            log.warn("Could not disable FOREIGN_KEY_CHECKS: {}", ex.getMessage());
        }

        // Drop dependent/join tables first, then parents
        String[] legacyTablesInOrder = new String[] {
            // old join/collection tables from previous mapping
            "employee_profile_current_goals",
            "employee_profile_skills",
            // parents (singular legacy names)
            "employee_profile",
            "goal",
            "appraisal",
            "review_cycle",
            "feedback",
            "user"
        };

        for (String table : legacyTablesInOrder) {
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS `" + table + "`");
                log.info("Dropped legacy table if existed: {}", table);
            } catch (Exception ex) {
                log.warn("Could not drop legacy table {}: {}", table, ex.getMessage());
            }
        }

        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");
        } catch (Exception ex) {
            log.warn("Could not re-enable FOREIGN_KEY_CHECKS: {}", ex.getMessage());
        }
    }
}


