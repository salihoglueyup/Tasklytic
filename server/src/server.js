import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { taskQueries, templateQueries, achievementQueries, userStatsQueries, fileQueries } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// TASK ROUTES
// ==========================================

app.get('/api/tasks', (req, res) => {
    try {
        const tasks = taskQueries.getAll();
        const formattedTasks = tasks.map(task => ({
            ...task,
            completed: Boolean(task.completed),
            tags: task.tags ? JSON.parse(task.tags) : [],
            recurring: task.recurring ? JSON.parse(task.recurring) : null,
            dependencies: task.dependencies ? JSON.parse(task.dependencies) : []
        }));
        res.json(formattedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.get('/api/tasks/:id', (req, res) => {
    try {
        const task = taskQueries.getById(req.params.id);
        if (task) {
            res.json({
                ...task,
                completed: Boolean(task.completed),
                tags: task.tags ? JSON.parse(task.tags) : [],
                recurring: task.recurring ? JSON.parse(task.recurring) : null,
                dependencies: task.dependencies ? JSON.parse(task.dependencies) : []
            });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

app.get('/api/tasks/:id/subtasks', (req, res) => {
    try {
        const subtasks = taskQueries.getSubtasks(req.params.id);
        const formattedSubtasks = subtasks.map(task => ({
            ...task,
            completed: Boolean(task.completed),
            tags: task.tags ? JSON.parse(task.tags) : [],
            recurring: task.recurring ? JSON.parse(task.recurring) : null
        }));
        res.json(formattedSubtasks);
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        res.status(500).json({ error: 'Failed to fetch subtasks' });
    }
});

app.post('/api/tasks', (req, res) => {
    try {
        const taskData = {
            ...req.body,
            tags: req.body.tags ? JSON.stringify(req.body.tags) : null,
            recurring: req.body.recurring ? JSON.stringify(req.body.recurring) : null,
            dependencies: req.body.dependencies ? JSON.stringify(req.body.dependencies) : null
        };

        taskQueries.create(taskData);

        const task = taskQueries.getById(taskData.id);
        res.status(201).json({
            ...task,
            completed: Boolean(task.completed),
            tags: task.tags ? JSON.parse(task.tags) : [],
            recurring: task.recurring ? JSON.parse(task.recurring) : null,
            dependencies: task.dependencies ? JSON.parse(task.dependencies) : []
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.put('/api/tasks/:id', (req, res) => {
    try {
        const taskData = {
            ...req.body,
            tags: req.body.tags ? JSON.stringify(req.body.tags) : null,
            recurring: req.body.recurring ? JSON.stringify(req.body.recurring) : null,
            dependencies: req.body.dependencies ? JSON.stringify(req.body.dependencies) : null
        };

        taskQueries.update(req.params.id, taskData);

        const task = taskQueries.getById(req.params.id);
        res.json({
            ...task,
            completed: Boolean(task.completed),
            tags: task.tags ? JSON.parse(task.tags) : [],
            recurring: task.recurring ? JSON.parse(task.recurring) : null,
            dependencies: task.dependencies ? JSON.parse(task.dependencies) : []
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.patch('/api/tasks/:id/sort', (req, res) => {
    try {
        const { sortOrder } = req.body;
        taskQueries.updateSortOrder(req.params.id, sortOrder);
        res.json({ message: 'Sort order updated' });
    } catch (error) {
        console.error('Error updating sort order:', error);
        res.status(500).json({ error: 'Failed to update sort order' });
    }
});

app.patch('/api/tasks/:id/time', (req, res) => {
    try {
        const task = taskQueries.getById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const { timeSpent } = req.body;
        taskQueries.update(req.params.id, { ...task, timeSpent: (task.timeSpent || 0) + timeSpent });

        res.json({ message: 'Time updated' });
    } catch (error) {
        console.error('Error updating time:', error);
        res.status(500).json({ error: 'Failed to update time' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    try {
        taskQueries.delete(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// ==========================================
// TEMPLATE ROUTES
// ==========================================

app.get('/api/templates', (req, res) => {
    try {
        const templates = templateQueries.getAll();
        const formattedTemplates = templates.map(t => ({
            ...t,
            tasks: t.tasks ? JSON.parse(t.tasks) : []
        }));
        res.json(formattedTemplates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

app.post('/api/templates', (req, res) => {
    try {
        const templateData = {
            ...req.body,
            tasks: JSON.stringify(req.body.tasks || [])
        };
        templateQueries.create(templateData);
        res.status(201).json({ message: 'Template created' });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

app.post('/api/templates/:id/apply', (req, res) => {
    try {
        const template = templateQueries.getById(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const tasks = JSON.parse(template.tasks);
        const createdTasks = [];

        tasks.forEach(task => {
            const newTask = {
                ...task,
                id: Date.now().toString() + Math.random(),
                createdAt: new Date().toISOString(),
                templateId: template.id
            };
            taskQueries.create(newTask);
            createdTasks.push(newTask);
        });

        res.json({ message: 'Template applied', tasks: createdTasks });
    } catch (error) {
        console.error('Error applying template:', error);
        res.status(500).json({ error: 'Failed to apply template' });
    }
});

app.delete('/api/templates/:id', (req, res) => {
    try {
        templateQueries.delete(req.params.id);
        res.json({ message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// ==========================================
// ACHIEVEMENT ROUTES
// ==========================================

app.get('/api/achievements', (req, res) => {
    try {
        const achievements = achievementQueries.getAll();
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

app.post('/api/achievements/:id/unlock', (req, res) => {
    try {
        achievementQueries.unlock(req.params.id);
        res.json({ message: 'Achievement unlocked!' });
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        res.status(500).json({ error: 'Failed to unlock achievement' });
    }
});

// ==========================================
// USER STATS ROUTES
// ==========================================

app.get('/api/stats', (req, res) => {
    try {
        const stats = userStatsQueries.get();
        res.json(stats || { streak: 0, level: 1, xp: 0, totalTasksCompleted: 0 });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.put('/api/stats', (req, res) => {
    try {
        userStatsQueries.update(req.body);
        res.json({ message: 'Stats updated' });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

// ==========================================
// FILE ROUTES
// ==========================================

app.get('/api/tasks/:taskId/files', (req, res) => {
    try {
        const files = fileQueries.getByTaskId(req.params.taskId);
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

app.post('/api/tasks/:taskId/files', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileData = {
            id: Date.now().toString(),
            taskId: req.params.taskId,
            filename: req.file.originalname,
            filepath: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString()
        };

        fileQueries.create(fileData);
        res.status(201).json(fileData);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.delete('/api/files/:id', (req, res) => {
    try {
        fileQueries.delete(req.params.id);
        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// ==========================================
// EXPORT/IMPORT
// ==========================================

app.get('/api/export', (req, res) => {
    try {
        const tasks = taskQueries.getAll();
        res.json(tasks);
    } catch (error) {
        console.error('Error exporting tasks:', error);
        res.status(500).json({ error: 'Failed to export tasks' });
    }
});

app.post('/api/import', (req, res) => {
    try {
        const { tasks } = req.body;
        tasks.forEach(task => {
            taskQueries.create(task);
        });
        res.json({ message: 'Tasks imported successfully', count: tasks.length });
    } catch (error) {
        console.error('Error importing tasks:', error);
        res.status(500).json({ error: 'Failed to import tasks' });
    }
});

// ==========================================
// AI ASSISTANT (Claude API)
// ==========================================

app.post('/api/ai/suggest', async (req, res) => {
    try {
        const { tasks, context } = req.body;

        // Claude API çağrısı için hazırlık
        const prompt = `Kullanıcının şu görevleri var: ${JSON.stringify(tasks)}. 
    Bağlam: ${context}. 
    Lütfen görev önceliklendirme, zaman yönetimi ve verimlilik tavsiyeleri ver.`;

        // Burada Claude API'ye istek atılacak
        // Şimdilik basit bir response dönelim

        res.json({
            suggestions: [
                "En yüksek öncelikli görevlerden başlayın",
                "Benzer görevleri gruplandırın",
                "Pomodoro tekniği kullanın"
            ],
            prioritizedTasks: tasks.slice(0, 5)
        });
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${join(__dirname, '../uploads')}`);
});