-- Locations Table
-- Represents hierarchical data for regions, countries, and branches
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_code TEXT, -- Auto-generated code (e.g., R-1, C-2, B-3)
    name TEXT NOT NULL, 
    type TEXT CHECK(type IN ('region', 'country', 'branch')) NOT NULL, 
    parent_id INTEGER, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES locations (id) ON DELETE CASCADE
);

-- Users Table
-- Stores user information and their association with branches
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Password should be hashed
    role TEXT CHECK(role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
    location_id INTEGER NOT NULL, -- Link to a branch in the locations table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);

-- Ideas Table
-- Stores ideas and their association with users and branches
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- Example: 'Renewable Energy', 'Urban Development'
    author_id INTEGER NOT NULL, -- Link to the user who submitted the idea
    location_id INTEGER NOT NULL, -- Link to a branch in the locations table
    votes INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'in-progress', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);

-- Votes Table
-- Tracks votes for ideas by users
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Link to the user who voted
    idea_id INTEGER NOT NULL, -- Link to the idea being voted on
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE,
    UNIQUE (user_id, idea_id) -- Ensure a user can vote only once per idea
);

-- Comments Table
-- Stores comments for ideas
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL, -- Link to the idea being commented on
    user_id INTEGER NOT NULL, -- Link to the user who commented
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Collaborations Table
-- Tracks collaboration teams for ideas
CREATE TABLE IF NOT EXISTS collaborations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL, -- Link to the idea being worked on
    user_id INTEGER NOT NULL, -- Link to the user in the team
    role TEXT, -- Example: 'team lead', 'contributor'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (idea_id, user_id) -- Prevent duplicate assignments
);

-- Incentives Table
-- Tracks points or rewards for users
CREATE TABLE IF NOT EXISTS incentives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Link to the user who earned the reward
    points INTEGER NOT NULL, -- Points awarded
    description TEXT, -- Example: 'Submitted idea', 'Voted on idea'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Audit Table
-- Tracks changes made to ideas
CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER NOT NULL, -- Link to the idea being audited
    changed_by INTEGER NOT NULL, -- Link to the user who made the change
    change_type TEXT CHECK(change_type IN ('status_update', 'edit', 'delete')) NOT NULL, -- Type of change
    old_value TEXT, -- Previous value before change
    new_value TEXT, -- Updated value after change
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE CASCADE
);

-- Notifications Table
-- Stores notifications for users
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Link to the user being notified
    message TEXT NOT NULL, -- Notification message
    is_read BOOLEAN DEFAULT FALSE, -- Read/unread status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- System Settings Table
-- Stores global system configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE, -- Example: 'max_votes', 'categories'
    setting_value TEXT NOT NULL -- Configuration value
);


-- Trigger to add location code
DROP TRIGGER IF EXISTS generate_location_code;

CREATE TRIGGER generate_location_code
AFTER INSERT ON locations
FOR EACH ROW
BEGIN
    -- Assign location_code for regions
    UPDATE locations
    SET location_code = 'R-' || (SELECT COUNT(*) FROM locations WHERE type = 'region')
    WHERE id = NEW.id AND NEW.type = 'region';

    -- Assign location_code for countries
    UPDATE locations
    SET location_code = 'C-' || (SELECT COUNT(*) FROM locations WHERE type = 'country')
    WHERE id = NEW.id AND NEW.type = 'country';

    -- Assign location_code for branches
    UPDATE locations
    SET location_code = 'B-' || (SELECT COUNT(*) FROM locations WHERE type = 'branch')
    WHERE id = NEW.id AND NEW.type = 'branch';
END;