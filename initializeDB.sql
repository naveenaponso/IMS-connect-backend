-- HR Table
CREATE TABLE IF NOT EXISTS hr_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('manager', 'employee','admin')) NOT NULL,
    location_id INTEGER NOT NULL, -- Links to locations table
    birthdate DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    salary REAL NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE, -- Date when employee joined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

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
    title TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- Example: 'Renewable Energy', 'Urban Development'
    location_id INTEGER, -- Link to a branch in the locations table
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'in-progress', 'completed')) DEFAULT 'pending',
    created_by INTEGER NOT NULL, -- Link to the user who created the idea
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
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
    idea_id INTEGER NOT NULL,  -- The idea being worked on
    user_id INTEGER NOT NULL,  -- The assigned employee
    role TEXT NOT NULL CHECK(role IN ('Team Lead', 'Contributor')),  -- Team role
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'removed')),  -- Collaboration status
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the user was assigned
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (idea_id, user_id)  -- Prevent duplicate assignments
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
-- Tracks changes made to all tables in the system
CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL, -- The table where the change occurred
    record_id INTEGER NOT NULL, -- The ID of the affected record
    changed_by INTEGER, -- User who made the change
    change_type TEXT CHECK(change_type IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL, -- Type of change
    old_value TEXT, -- Previous value before change (for updates & deletes)
    new_value TEXT, -- Updated value after change (for inserts & updates)
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
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


-- triggers to record audit alerts
DROP TRIGGER IF EXISTS audit_ideas_update;
CREATE TRIGGER audit_ideas_update
AFTER UPDATE ON ideas
FOR EACH ROW
BEGIN
    INSERT INTO audit (table_name, record_id, changed_by, change_type, old_value, new_value)
    SELECT 'ideas', OLD.id, OLD.created_by, 'UPDATE',
           json_object(
               'title', CASE WHEN OLD.title != NEW.title THEN OLD.title ELSE NULL END,
               'description', CASE WHEN OLD.description != NEW.description THEN OLD.description ELSE NULL END,
               'category', CASE WHEN OLD.category != NEW.category THEN OLD.category ELSE NULL END,
               'status', CASE WHEN OLD.status != NEW.status THEN OLD.status ELSE NULL END
           ),
           json_object(
               'title', CASE WHEN OLD.title != NEW.title THEN NEW.title ELSE NULL END,
               'description', CASE WHEN OLD.description != NEW.description THEN NEW.description ELSE NULL END,
               'category', CASE WHEN OLD.category != NEW.category THEN NEW.category ELSE NULL END,
               'status', CASE WHEN OLD.status != NEW.status THEN NEW.status ELSE NULL END
           )
    WHERE OLD.title != NEW.title
       OR OLD.description != NEW.description
       OR OLD.category != NEW.category
       OR OLD.status != NEW.status;
END;

DROP TRIGGER IF EXISTS audit_ideas_delete;
CREATE TRIGGER audit_ideas_delete
AFTER DELETE ON ideas
FOR EACH ROW
BEGIN
    INSERT INTO audit (table_name, record_id, changed_by, change_type, old_value)
    VALUES ('ideas', OLD.id, OLD.created_by, 'DELETE',
            json_object('title', OLD.title, 'description', OLD.description, 'category', OLD.category, 'status', OLD.status));
END;

DROP TRIGGER IF EXISTS audit_users_update;
CREATE TRIGGER audit_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit (table_name, record_id, changed_by, change_type, old_value, new_value)
    SELECT 'users', OLD.id, OLD.id, 'UPDATE',
           json_object(
               'name', CASE WHEN OLD.name != NEW.name THEN OLD.name ELSE NULL END,
               'email', CASE WHEN OLD.email != NEW.email THEN OLD.email ELSE NULL END,
               'role', CASE WHEN OLD.role != NEW.role THEN OLD.role ELSE NULL END,
               'location_id', CASE WHEN OLD.location_id != NEW.location_id THEN OLD.location_id ELSE NULL END
           ),
           json_object(
               'name', CASE WHEN OLD.name != NEW.name THEN NEW.name ELSE NULL END,
               'email', CASE WHEN OLD.email != NEW.email THEN NEW.email ELSE NULL END,
               'role', CASE WHEN OLD.role != NEW.role THEN NEW.role ELSE NULL END,
               'location_id', CASE WHEN OLD.location_id != NEW.location_id THEN NEW.location_id ELSE NULL END
           )
    WHERE OLD.name != NEW.name
       OR OLD.email != NEW.email
       OR OLD.role != NEW.role
       OR OLD.location_id != NEW.location_id;
END;

DROP TRIGGER IF EXISTS audit_users_delete;
CREATE TRIGGER audit_users_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit (table_name, record_id, changed_by, change_type, old_value)
    VALUES ('users', OLD.id, OLD.id, 'DELETE',
            json_object('name', OLD.name, 'email', OLD.email, 'role', OLD.role, 'location_id', OLD.location_id));
END;


-- triggers to record incentives
DROP TRIGGER IF EXISTS after_idea_submission;
CREATE TRIGGER after_idea_submission
AFTER INSERT ON ideas
FOR EACH ROW
BEGIN
    INSERT INTO incentives (user_id, points, description)
    VALUES (
        NEW.created_by,
        (SELECT setting_value FROM system_settings WHERE setting_key = 'points_per_idea_submission'),
        'Submitted an idea'
    );
END;

DROP TRIGGER IF EXISTS after_vote_cast;
CREATE TRIGGER after_vote_cast
AFTER INSERT ON votes
FOR EACH ROW
BEGIN
    INSERT INTO incentives (user_id, points, description)
    VALUES (
        NEW.user_id,
        (SELECT setting_value FROM system_settings WHERE setting_key = 'points_per_vote'),
        'Voted on an idea'
    );
END;

DROP TRIGGER IF EXISTS after_comment_added;
CREATE TRIGGER after_comment_added
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    INSERT INTO incentives (user_id, points, description)
    VALUES (
        NEW.user_id,
        (SELECT setting_value FROM system_settings WHERE setting_key = 'points_per_comment'),
        'Commented on an idea'
    );
END;

DROP TRIGGER IF EXISTS after_collaboration_assigned;
CREATE TRIGGER after_collaboration_assigned
AFTER INSERT ON collaborations
FOR EACH ROW
BEGIN
    INSERT INTO incentives (user_id, points, description)
    VALUES (
        NEW.user_id,
        (SELECT setting_value FROM system_settings WHERE setting_key = 'points_per_collaboration'),
        'Collaborated on an idea'
    );
END;
