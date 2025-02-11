
-- Insert Regions
INSERT INTO locations (name, type, parent_id) VALUES
	('North America', 'region', NULL),
    ('Europe', 'region', NULL),
    ('Asia', 'region', NULL),
    ('South America', 'region', NULL),
    ('Africa', 'region', NULL);

-- Insert Countries (linked to their respective regions)
INSERT INTO locations (name, type, parent_id) VALUES 
    ('United States', 'country', (SELECT id FROM locations WHERE name = 'North America' AND type = 'region')),
    ('Canada', 'country', (SELECT id FROM locations WHERE name = 'North America' AND type = 'region')),
    ('Germany', 'country', (SELECT id FROM locations WHERE name = 'Europe' AND type = 'region')),
    ('United Kingdom', 'country', (SELECT id FROM locations WHERE name = 'Europe' AND type = 'region')),
    ('Japan', 'country', (SELECT id FROM locations WHERE name = 'Asia' AND type = 'region')),
    ('India', 'country', (SELECT id FROM locations WHERE name = 'Asia' AND type = 'region')),
    ('Brazil', 'country', (SELECT id FROM locations WHERE name = 'South America' AND type = 'region')),
    ('Argentina', 'country', (SELECT id FROM locations WHERE name = 'South America' AND type = 'region')),
    ('South Africa', 'country', (SELECT id FROM locations WHERE name = 'Africa' AND type = 'region')),
    ('Nigeria', 'country', (SELECT id FROM locations WHERE name = 'Africa' AND type = 'region'));

-- Insert Branches (linked to their respective countries)
INSERT INTO locations (name, type, parent_id) VALUES 
    ('New York Office', 'branch', (SELECT id FROM locations WHERE name = 'United States' AND type = 'country')),
    ('San Francisco Office', 'branch', (SELECT id FROM locations WHERE name = 'United States' AND type = 'country')),
    ('Toronto Office', 'branch', (SELECT id FROM locations WHERE name = 'Canada' AND type = 'country')),
    ('Berlin Office', 'branch', (SELECT id FROM locations WHERE name = 'Germany' AND type = 'country')),
    ('London Office', 'branch', (SELECT id FROM locations WHERE name = 'United Kingdom' AND type = 'country')),
    ('Tokyo Office', 'branch', (SELECT id FROM locations WHERE name = 'Japan' AND type = 'country')),
    ('Mumbai Office', 'branch', (SELECT id FROM locations WHERE name = 'India' AND type = 'country')),
    ('São Paulo Office', 'branch', (SELECT id FROM locations WHERE name = 'Brazil' AND type = 'country')),
    ('Buenos Aires Office', 'branch', (SELECT id FROM locations WHERE name = 'Argentina' AND type = 'country')),
    ('Cape Town Office', 'branch', (SELECT id FROM locations WHERE name = 'South Africa' AND type = 'country')),
    ('Lagos Office', 'branch', (SELECT id FROM locations WHERE name = 'Nigeria' AND type = 'country'));


INSERT INTO hr_employees (name, role, location_id, birthdate, email, phone, salary)
VALUES 
    ('Alice Johnson', 'manager', 20, '1990-05-10', 'alice.johnson@example.com', '1234567890', 60000),
    ('Bob Smith', 'manager', 16, '1985-08-15', 'bob.smith@example.com', '1234567891 ', 85000),
    ('Charlie Brown', 'employee', 17, '1992-03-22', 'charlie.brown@example.com', '1234567892', 50000),
    ('David White', 'admin', 18, '2000-11-05', 'david.white@example.com', '1234567893', 20000),
    ('John Doe', 'employee', 19, '1988-07-30','john.doe@example.com', '0087456321', 55000)
    ;


INSERT INTO system_settings (setting_key, setting_value) VALUES 
    ('points_per_idea_submission', '10'),
    ('points_per_vote', '2'),
    ('points_per_comment', '3'),
    ('points_per_collaboration', '5');
