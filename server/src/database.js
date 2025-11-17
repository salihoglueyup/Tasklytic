import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database.db');
const uploadsPath = join(__dirname, '../uploads');

// Uploads klasörü oluştur
if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
}

let SQL;
let db;

async function initDb() {
    SQL = await initSqlJs();

    if (existsSync(dbPath)) {
        const buffer = readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();

        // Tasks table
        db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
                                                 id TEXT PRIMARY KEY,
                                                 title TEXT NOT NULL,
                                                 description TEXT,
                                                 completed INTEGER DEFAULT 0,
                                                 category TEXT NOT NULL,
                                                 priority TEXT NOT NULL,
                                                 dueDate TEXT,
                                                 createdAt TEXT NOT NULL,
                                                 completedAt TEXT,
                                                 tags TEXT,
                                                 notes TEXT,
                                                 recurring TEXT,
                                                 pomodoroCount INTEGER DEFAULT 0,
                                                 estimatedPomodoros INTEGER DEFAULT 0,
                                                 parentTaskId TEXT,
                                                 sortOrder INTEGER DEFAULT 0,
                                                 timeSpent INTEGER DEFAULT 0,
                                                 dependencies TEXT,
                                                 assignedTo TEXT,
                                                 reminderTime TEXT,
                                                 templateId TEXT,
                                                 status TEXT DEFAULT 'todo'
            )
        `);

        // Templates table
        db.run(`
            CREATE TABLE IF NOT EXISTS templates (
                                                     id TEXT PRIMARY KEY,
                                                     name TEXT NOT NULL,
                                                     description TEXT,
                                                     tasks TEXT,
                                                     createdAt TEXT NOT NULL
            )
        `);

        // Achievements table
        db.run(`
            CREATE TABLE IF NOT EXISTS achievements (
                                                        id TEXT PRIMARY KEY,
                                                        name TEXT NOT NULL,
                                                        description TEXT,
                                                        icon TEXT,
                                                        unlockedAt TEXT,
                                                        progress INTEGER DEFAULT 0,
                                                        target INTEGER DEFAULT 100
            )
        `);

        // User stats table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_stats (
                                                      id INTEGER PRIMARY KEY,
                                                      streak INTEGER DEFAULT 0,
                                                      lastActiveDate TEXT,
                                                      totalTasksCompleted INTEGER DEFAULT 0,
                                                      totalTimeSpent INTEGER DEFAULT 0,
                                                      level INTEGER DEFAULT 1,
                                                      xp INTEGER DEFAULT 0
            )
        `);

        // Files table
        db.run(`
            CREATE TABLE IF NOT EXISTS files (
                                                 id TEXT PRIMARY KEY,
                                                 taskId TEXT,
                                                 filename TEXT,
                                                 filepath TEXT,
                                                 size INTEGER,
                                                 mimetype TEXT,
                                                 uploadedAt TEXT
            )
        `);

        // Comments table
        db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                                                    id TEXT PRIMARY KEY,
                                                    taskId TEXT,
                                                    userId TEXT,
                                                    content TEXT,
                                                    createdAt TEXT
            )
        `);

        // Initialize user stats
        db.run(`INSERT INTO user_stats (id, streak, lastActiveDate, totalTasksCompleted, totalTimeSpent, level, xp)
                VALUES (1, 0, datetime('now'), 0, 0, 1, 0)`);

        saveDb();
    }

    // Add new columns if they don't exist
    try { db.run(`ALTER TABLE tasks ADD COLUMN timeSpent INTEGER DEFAULT 0`); } catch (e) {}
    try { db.run(`ALTER TABLE tasks ADD COLUMN dependencies TEXT`); } catch (e) {}
    try { db.run(`ALTER TABLE tasks ADD COLUMN assignedTo TEXT`); } catch (e) {}
    try { db.run(`ALTER TABLE tasks ADD COLUMN reminderTime TEXT`); } catch (e) {}
    try { db.run(`ALTER TABLE tasks ADD COLUMN templateId TEXT`); } catch (e) {}
    try { db.run(`ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'todo'`); } catch (e) {}

    saveDb();
}

function saveDb() {
    const data = db.export();
    writeFileSync(dbPath, data);
}

// Task queries
export const taskQueries = {
    getAll: () => {
        const result = db.exec('SELECT * FROM tasks ORDER BY sortOrder DESC, createdAt DESC');
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const task = {};
            columns.forEach((col, i) => {
                task[col] = row[i];
            });
            return task;
        });
    },

    getById: (id) => {
        const result = db.exec('SELECT * FROM tasks WHERE id = ?', [id]);
        if (result.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const task = {};
        columns.forEach((col, i) => {
            task[col] = row[i];
        });
        return task;
    },

    getSubtasks: (parentId) => {
        const result = db.exec('SELECT * FROM tasks WHERE parentTaskId = ? ORDER BY sortOrder DESC, createdAt DESC', [parentId]);
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const task = {};
            columns.forEach((col, i) => {
                task[col] = row[i];
            });
            return task;
        });
    },

    create: (task) => {
        const {
            id, title, description, completed, category, priority, dueDate, createdAt, completedAt,
            tags, notes, recurring, pomodoroCount, estimatedPomodoros, parentTaskId, sortOrder,
            timeSpent, dependencies, assignedTo, reminderTime, templateId, status
        } = task;

        db.run(
            `INSERT INTO tasks (id, title, description, completed, category, priority, dueDate, createdAt, completedAt,
                                tags, notes, recurring, pomodoroCount, estimatedPomodoros, parentTaskId, sortOrder, timeSpent, dependencies,
                                assignedTo, reminderTime, templateId, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, title, description || '', completed ? 1 : 0, category, priority, dueDate || null, createdAt,
                completedAt || null, tags || null, notes || null, recurring || null, pomodoroCount || 0,
                estimatedPomodoros || 0, parentTaskId || null, sortOrder || 0, timeSpent || 0, dependencies || null,
                assignedTo || null, reminderTime || null, templateId || null, status || 'todo'
            ]
        );
        saveDb();
    },

    update: (id, task) => {
        const {
            title, description, completed, category, priority, dueDate, completedAt, tags, notes, recurring,
            pomodoroCount, estimatedPomodoros, parentTaskId, sortOrder, timeSpent, dependencies, assignedTo,
            reminderTime, status
        } = task;

        db.run(
            `UPDATE tasks SET title = ?, description = ?, completed = ?, category = ?, priority = ?, dueDate = ?,
                              completedAt = ?, tags = ?, notes = ?, recurring = ?, pomodoroCount = ?, estimatedPomodoros = ?,
                              parentTaskId = ?, sortOrder = ?, timeSpent = ?, dependencies = ?, assignedTo = ?, reminderTime = ?, status = ?
             WHERE id = ?`,
            [
                title, description || '', completed ? 1 : 0, category, priority, dueDate || null, completedAt || null,
                tags || null, notes || null, recurring || null, pomodoroCount || 0, estimatedPomodoros || 0,
                parentTaskId || null, sortOrder || 0, timeSpent || 0, dependencies || null, assignedTo || null,
                reminderTime || null, status || 'todo', id
            ]
        );
        saveDb();
    },

    updateSortOrder: (id, sortOrder) => {
        db.run('UPDATE tasks SET sortOrder = ? WHERE id = ?', [sortOrder, id]);
        saveDb();
    },

    delete: (id) => {
        db.run('DELETE FROM tasks WHERE parentTaskId = ?', [id]);
        db.run('DELETE FROM tasks WHERE id = ?', [id]);
        db.run('DELETE FROM files WHERE taskId = ?', [id]);
        db.run('DELETE FROM comments WHERE taskId = ?', [id]);
        saveDb();
        return { changes: 1 };
    }
};

// Template queries
export const templateQueries = {
    getAll: () => {
        const result = db.exec('SELECT * FROM templates ORDER BY createdAt DESC');
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const template = {};
            columns.forEach((col, i) => {
                template[col] = row[i];
            });
            return template;
        });
    },

    getById: (id) => {
        const result = db.exec('SELECT * FROM templates WHERE id = ?', [id]);
        if (result.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const template = {};
        columns.forEach((col, i) => {
            template[col] = row[i];
        });
        return template;
    },

    create: (template) => {
        const { id, name, description, tasks, createdAt } = template;
        db.run(
            'INSERT INTO templates (id, name, description, tasks, createdAt) VALUES (?, ?, ?, ?, ?)',
            [id, name, description || '', tasks, createdAt]
        );
        saveDb();
    },

    delete: (id) => {
        db.run('DELETE FROM templates WHERE id = ?', [id]);
        saveDb();
    }
};

// Achievement queries
export const achievementQueries = {
    getAll: () => {
        const result = db.exec('SELECT * FROM achievements');
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const achievement = {};
            columns.forEach((col, i) => {
                achievement[col] = row[i];
            });
            return achievement;
        });
    },

    unlock: (id) => {
        db.run('UPDATE achievements SET unlockedAt = datetime("now") WHERE id = ?', [id]);
        saveDb();
    },

    updateProgress: (id, progress) => {
        db.run('UPDATE achievements SET progress = ? WHERE id = ?', [progress, id]);
        saveDb();
    }
};

// User stats queries
export const userStatsQueries = {
    get: () => {
        const result = db.exec('SELECT * FROM user_stats WHERE id = 1');
        if (result.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const stats = {};
        columns.forEach((col, i) => {
            stats[col] = row[i];
        });
        return stats;
    },

    update: (stats) => {
        const { streak, lastActiveDate, totalTasksCompleted, totalTimeSpent, level, xp } = stats;
        db.run(
            'UPDATE user_stats SET streak = ?, lastActiveDate = ?, totalTasksCompleted = ?, totalTimeSpent = ?, level = ?, xp = ? WHERE id = 1',
            [streak, lastActiveDate, totalTasksCompleted, totalTimeSpent, level, xp]
        );
        saveDb();
    }
};

// Files queries
export const fileQueries = {
    getByTaskId: (taskId) => {
        const result = db.exec('SELECT * FROM files WHERE taskId = ?', [taskId]);
        if (result.length === 0) return [];

        const columns = result[0].columns;
        return result[0].values.map(row => {
            const file = {};
            columns.forEach((col, i) => {
                file[col] = row[i];
            });
            return file;
        });
    },

    create: (file) => {
        const { id, taskId, filename, filepath, size, mimetype, uploadedAt } = file;
        db.run(
            'INSERT INTO files (id, taskId, filename, filepath, size, mimetype, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, taskId, filename, filepath, size, mimetype, uploadedAt]
        );
        saveDb();
    },

    delete: (id) => {
        db.run('DELETE FROM files WHERE id = ?', [id]);
        saveDb();
    }
};

// Initialize
await initDb();

export default db;