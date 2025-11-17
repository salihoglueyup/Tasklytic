import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus, Trash2, Check, Search, Calendar, AlertCircle, BarChart3, Moon, Sun,
    TrendingUp, Clock, Target, Award, Tag, Download, Upload, Play, Pause,
    RotateCcw, ChevronDown, ChevronRight, GripVertical, LayoutTemplate,
    Trophy, Zap, Flame, X, List, LayoutGrid, Filter, SortAsc,
    Calendar as CalendarIcon
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TodoApp() {
    const [tasks, setTasks] = useState([]);
    const [userStats, setUserStats] = useState({
        streak: 0, level: 1, xp: 0, totalTasksCompleted: 0, lastActiveDate: null
    });
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showFocusMode, setShowFocusMode] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [newTask, setNewTask] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('personal');
    const [selectedPriority, setSelectedPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [expandedTasks, setExpandedTasks] = useState({});
    const [showSubtaskInput, setShowSubtaskInput] = useState(null);
    const [newSubtask, setNewSubtask] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [pomodoroRunning, setPomodoroRunning] = useState(false);
    const [currentPomodoroTask, setCurrentPomodoroTask] = useState(null);
    const pomodoroInterval = useRef(null);
    const [newTag, setNewTag] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [focusTask, setFocusTask] = useState(null);
    const [achievements, setAchievements] = useState([]);

    const API_URL = 'http://localhost:3001/api';

    const categories = [
        { id: 'personal', name: 'Kişisel', color: 'bg-blue-500', icon: '🏠' },
        { id: 'work', name: 'İş', color: 'bg-purple-500', icon: '💼' },
        { id: 'shopping', name: 'Alışveriş', color: 'bg-green-500', icon: '🛒' },
        { id: 'health', name: 'Sağlık', color: 'bg-red-500', icon: '❤️' }
    ];

    const priorities = [
        { id: 'low', name: 'Düşük', color: 'text-gray-500', badge: 'bg-gray-100' },
        { id: 'medium', name: 'Orta', color: 'text-yellow-600', badge: 'bg-yellow-100' },
        { id: 'high', name: 'Yüksek', color: 'text-orange-600', badge: 'bg-orange-100' },
        { id: 'urgent', name: 'Acil', color: 'text-red-600', badge: 'bg-red-100' }
    ];

    const ACHIEVEMENT_DEFINITIONS = [
        { id: 'first_task', name: 'İlk Adım', description: 'İlk görevini tamamla', icon: '🎯' },
        { id: 'task_master_10', name: 'Görev Ustası', description: '10 görev tamamla', icon: '🏆' },
        { id: 'task_master_50', name: 'Süper Verimli', description: '50 görev tamamla', icon: '⭐' },
        { id: 'streak_7', name: '7 Gün', description: '7 gün üst üste görev tamamla', icon: '🔥' }
    ];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        if (pomodoroRunning && pomodoroTime > 0) {
            pomodoroInterval.current = setInterval(() => {
                setPomodoroTime(prev => {
                    if (prev <= 1) {
                        setPomodoroRunning(false);
                        handlePomodoroComplete();
                        return 25 * 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(pomodoroInterval.current);
        }
        return () => clearInterval(pomodoroInterval.current);
    }, [pomodoroRunning]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchTasks(), fetchUserStats()]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const data = await response.json();
            setUserStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const addTask = async (parentTaskId = null) => {
        const taskTitle = parentTaskId ? newSubtask : newTask;
        if (!taskTitle.trim()) return;

        const task = {
            id: Date.now().toString(),
            title: taskTitle,
            completed: false,
            category: selectedCategory,
            priority: selectedPriority,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString(),
            description: '',
            tags: [],
            pomodoroCount: 0,
            parentTaskId: parentTaskId,
            sortOrder: tasks.length,
            timeSpent: 0
        };

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });

            if (response.ok) {
                const savedTask = await response.json();
                setTasks([savedTask, ...tasks]);
                if (parentTaskId) {
                    setNewSubtask('');
                    setShowSubtaskInput(null);
                } else {
                    setNewTask('');
                    setDueDate('');
                }
                showNotification(`✅ Görev eklendi!`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updatedTask = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null
        };

        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            if (response.ok) {
                const saved = await response.json();
                setTasks(tasks.map(t => t.id === id ? saved : t));
                if (!task.completed) {
                    updateUserStatsOnComplete();
                    showNotification(`🎉 Görev tamamlandı!`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setTasks(tasks.filter(t => t.id !== id));
                if (selectedTask?.id === id) setSelectedTask(null);
                showNotification('🗑️ Görev silindi');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateTask = async (id, updates) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, ...updates };

        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            if (response.ok) {
                const saved = await response.json();
                setTasks(tasks.map(t => t.id === id ? saved : t));
                if (selectedTask?.id === id) setSelectedTask(saved);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const showNotification = (message, type = 'success') => {
        const notification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, notification]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 3000);
    };

    const handlePomodoroComplete = () => {
        if (currentPomodoroTask) {
            updateTask(currentPomodoroTask.id, {
                pomodoroCount: (currentPomodoroTask.pomodoroCount || 0) + 1
            });
            showNotification(`🍅 Pomodoro tamamlandı!`);
        }
    };

    const updateUserStatsOnComplete = async () => {
        const newStats = {
            ...userStats,
            totalTasksCompleted: userStats.totalTasksCompleted + 1,
            xp: userStats.xp + 10
        };

        const xpForNextLevel = newStats.level * 100;
        if (newStats.xp >= xpForNextLevel) {
            newStats.level += 1;
            newStats.xp -= xpForNextLevel;
            showNotification(`🎊 Level Up! Artık ${newStats.level}. seviyesiniz!`);
        }

        try {
            await fetch(`${API_URL}/stats`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStats)
            });
            setUserStats(newStats);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleExpanded = (taskId) => {
        setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const getSubtasks = (parentId) => tasks.filter(t => t.parentTaskId === parentId);
    const getCategoryById = (id) => categories.find(c => c.id === id);
    const getPriorityById = (id) => priorities.find(p => p.id === id);

    const addTagToTask = (taskId, tag) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !tag.trim()) return;
        const tags = task.tags || [];
        if (!tags.includes(tag)) {
            updateTask(taskId, { tags: [...tags, tag.trim()] });
        }
    };

    const removeTagFromTask = (taskId, tag) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const tags = (task.tags || []).filter(t => t !== tag);
        updateTask(taskId, { tags });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = tasks.findIndex(t => t.id === active.id);
            const newIndex = tasks.findIndex(t => t.id === over.id);
            setTasks(arrayMove(tasks, oldIndex, newIndex));
        }
    };

    const exportTasks = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('📥 Dışa aktarıldı');
    };

    const importTasks = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    for (const task of imported) {
                        await fetch(`${API_URL}/tasks`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...task, id: Date.now().toString() + Math.random() })
                        });
                    }
                    fetchTasks();
                    showNotification('📤 İçe aktarıldı');
                } catch (error) {
                    showNotification('❌ Başarısız!', 'error');
                }
            };
            reader.readAsText(file);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCompleted = showCompleted || !task.completed;
            const isMainTask = !task.parentTaskId;
            return matchesCategory && matchesPriority && matchesSearch && matchesCompleted && isMainTask;
        });
    }, [tasks, filterCategory, filterPriority, searchQuery, showCompleted]);

    const stats = useMemo(() => {
        const total = tasks.filter(t => !t.parentTaskId).length;
        const completed = tasks.filter(t => t.completed && !t.parentTaskId).length;
        const urgent = tasks.filter(t => t.priority === 'urgent' && !t.completed && !t.parentTaskId).length;
        const today = tasks.filter(t => {
            if (!t.dueDate || t.parentTaskId) return false;
            const due = new Date(t.dueDate);
            const now = new Date();
            return due.toDateString() === now.toDateString() && !t.completed;
        }).length;

        const byCategory = categories.map(cat => ({
            name: cat.name,
            value: tasks.filter(t => t.category === cat.id && !t.parentTaskId).length
        }));

        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const completedOnDate = tasks.filter(t =>
                t.completedAt && t.completedAt.startsWith(dateStr) && !t.parentTaskId
            ).length;
            weeklyData.push({
                day: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
                completed: completedOnDate
            });
        }

        return {
            total,
            completed,
            urgent,
            today,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            byCategory,
            weeklyData,
            averagePerDay: (weeklyData.reduce((sum, d) => sum + d.completed, 0) / 7).toFixed(1)
        };
    }, [tasks, categories]);

    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

    // Components
    const NotificationContainer = () => (
        <div className="fixed top-20 right-6 z-50 space-y-2">
            {notifications.map(notif => (
                <div key={notif.id} className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                    notif.type === 'error' ? 'bg-red-500 text-white' :
                        notif.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                }`}>
                    <span>{notif.message}</span>
                    <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );

    const UserLevelDisplay = () => {
        const xpForNextLevel = userStats.level * 100;
        const xpProgress = (userStats.xp / xpForNextLevel) * 100;

        return (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl p-4 mb-6`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {userStats.level}
                        </div>
                        <div>
                            <div className="font-semibold">Level {userStats.level}</div>
                            <div className="text-sm text-gray-500">{userStats.xp} / {xpForNextLevel} XP</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-500">{userStats.streak}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                Streak
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{userStats.totalTasksCompleted}</div>
                            <div className="text-xs text-gray-500">Görev</div>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
            </div>
        );
    };

    const SortableTask = ({ task }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
        const style = { transform: CSS.Transform.toString(transform), transition };
        const category = getCategoryById(task.category);
        const priority = getPriorityById(task.priority);
        const subtasks = getSubtasks(task.id);
        const isExpanded = expandedTasks[task.id];

        return (
            <div ref={setNodeRef} style={style}>
                <div onClick={() => setSelectedTask(task)} className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 transition cursor-pointer border-2 ${selectedTask?.id === task.id ? 'border-blue-500' : 'border-transparent'}`}>
                    <div className="flex items-start gap-4">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.completed ? 'bg-green-500 border-green-500' : (darkMode ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500')}`}>
                            {task.completed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                {subtasks.length > 0 && (
                                    <button onClick={(e) => { e.stopPropagation(); toggleExpanded(task.id); }} className="text-gray-500">
                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                )}
                                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                                {category && <span className={`${category.color} text-white text-xs px-2 py-1 rounded`}>{category.icon} {category.name}</span>}
                                {priority && <span className={`${priority.badge} ${priority.color} text-xs px-2 py-1 rounded`}>{priority.name}</span>}
                                {subtasks.length > 0 && <span className="text-xs text-gray-500">{subtasks.filter(s => s.completed).length}/{subtasks.length} ✓</span>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(task.createdAt).toLocaleDateString('tr-TR')}</span>
                                {task.dueDate && <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-600 font-semibold' : 'text-orange-600'}`}><AlertCircle className="w-4 h-4" />{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>}
                                {task.tags && task.tags.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        {task.tags.slice(0, 2).map((tag, i) => <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{tag}</span>)}
                                        {task.tags.length > 2 && <span className="text-xs">+{task.tags.length - 2}</span>}
                                    </div>
                                )}
                                {task.pomodoroCount > 0 && <span className="text-red-600">🍅 {task.pomodoroCount}</span>}
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {isExpanded && subtasks.length > 0 && (
                    <div className="ml-16 mt-2 space-y-2">
                        {subtasks.map(subtask => (
                            <div key={subtask.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 flex items-center gap-3`}>
                                <button onClick={() => toggleTask(subtask.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                    {subtask.completed && <Check className="w-3 h-3 text-white" />}
                                </button>
                                <span className={subtask.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}>{subtask.title}</span>
                                <button onClick={() => deleteTask(subtask.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showSubtaskInput === task.id && (
                    <div className="ml-16 mt-2 flex gap-2">
                        <input type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask(task.id)} placeholder="Alt görev ekle..." className={`flex-1 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0 focus:ring-2 focus:ring-blue-500`} autoFocus />
                        <button onClick={() => addTask(task.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ekle</button>
                        <button onClick={() => { setShowSubtaskInput(null); setNewSubtask(''); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">İptal</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <NotificationContainer />

            {/* ODAKLANMA MODALI */}
            {showFocusMode && focusTask && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
                    <div className="max-w-4xl w-full">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-bold text-white">Odaklanma Modu</h1>
                            <button onClick={() => setShowFocusMode(false)} className="text-white hover:text-gray-300">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="bg-gray-800 rounded-2xl p-8">
                            <h2 className="text-3xl font-bold text-white mb-4">{focusTask.title}</h2>
                            <p className="text-gray-300 mb-6">{focusTask.description || 'Görev açıklaması yok'}</p>
                            <div className="flex items-center justify-center mb-8">
                                <div className="text-7xl font-bold text-white">{formatTime(pomodoroTime)}</div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setPomodoroRunning(!pomodoroRunning)} className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-3">
                                    {pomodoroRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    {pomodoroRunning ? 'Durdur' : 'Başlat'}
                                </button>
                                <button onClick={() => { setPomodoroTime(25 * 60); setPomodoroRunning(false); }} className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600">
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* İSTATİSTİK MODALI (BURAYA TAŞINDI) */}
            {showStats && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowStats(false)}>
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3"><TrendingUp className="w-8 h-8 text-blue-500" />Detaylı İstatistikler</h2>
                            <button onClick={() => setShowStats(false)} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>Kapat</button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white`}>
                                <Target className="w-8 h-8 mb-3 opacity-80" />
                                <div className="text-3xl font-bold mb-1">{stats.percentage}%</div>
                                <div className="text-sm opacity-90">Tamamlanma Oranı</div>
                                <div className="text-xs opacity-75 mt-1">{stats.completed}/{stats.total} görev</div>
                            </div>
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'} text-white`}>
                                <Award className="w-8 h-8 mb-3 opacity-80" />
                                <div className="text-3xl font-bold mb-1">Level {userStats.level}</div>
                                <div className="text-sm opacity-90">Seviye</div>
                                <div className="text-xs opacity-75 mt-1">{userStats.xp} XP</div>
                            </div>
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white`}>
                                <Clock className="w-8 h-8 mb-3 opacity-80" />
                                <div className="text-3xl font-bold mb-1">{stats.averagePerDay}</div>
                                <div className="text-sm opacity-90">Günlük Ortalama</div>
                                <div className="text-xs opacity-75 mt-1">Son 7 gün</div>
                            </div>
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
                                <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
                                <div className="text-3xl font-bold mb-1">{stats.urgent}</div>
                                <div className="text-sm opacity-90">Acil Görevler</div>
                                <div className="text-xs opacity-75 mt-1">Tamamlanmamış</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <h3 className="text-lg font-semibold mb-4">Haftalık Tamamlama Trendi</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={stats.weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', border: 'none', borderRadius: '8px' }} />
                                        <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <h3 className="text-lg font-semibold mb-4">Kategorilere Göre Dağılım</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={stats.byCategory.filter(c => c.value > 0)} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                                            {stats.byCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', border: 'none', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 sticky top-0 z-40`}>
                <div className="flex items-center justify-between max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">✓</div>
                        <h1 className="text-2xl font-bold">Görev Yöneticim Pro</h1>
                        <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded">ULTIMATE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Görev ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}><List className="w-5 h-5" /></button>
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}><LayoutGrid className="w-5 h-5" /></button>
                            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}><CalendarIcon className="w-5 h-5" /></button>
                        </div>
                        <button onClick={() => setShowTemplates(true)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><LayoutTemplate className="w-5 h-5" /></button>
                        <button onClick={() => setShowAchievements(true)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><Trophy className="w-5 h-5" /></button>
                        <button onClick={exportTasks} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><Download className="w-5 h-5" /></button>
                        <label className={`p-2 rounded-lg cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <Upload className="w-5 h-5" />
                            <input type="file" accept=".json" onChange={importTasks} className="hidden" />
                        </label>
                        <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setShowStats(!showStats)} className={`px-4 py-2 rounded-lg font-medium ${showStats ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}>
                            <BarChart3 className="w-5 h-5 inline mr-2" />İstatistikler
                        </button>
                    </div>
                </div>
            </div>

            {/* ANA İÇERİK ALANI (EKSİK OLAN YER) */}
            <div className="max-w-[1800px] mx-auto flex gap-6 p-6">

                {/* Sol Sütun (Filtreler, Görev Ekleme vs.) */}
                <div className="w-1/3 space-y-6 lg:w-1/4">
                    <UserLevelDisplay />

                    {/* Yeni Görev Ekleme Formu */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow`}>
                        <h2 className="text-xl font-semibold mb-4">Yeni Görev Ekle</h2>
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTask(null)}
                            placeholder="Yeni görev..."
                            className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0 mb-3`}
                        />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0 mb-3`}
                        />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0`}>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                            </select>
                            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0`}>
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => addTask(null)}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Plus className="w-5 h-5" /> Ekle
                        </button>
                    </div>

                    {/* Filtreleme */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow`}>
                        <h3 className="font-semibold mb-3">Filtreler</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm">Kategori</label>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0 mt-1`}>
                                    <option value="all">Tümü</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Öncelik</label>
                                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-0 mt-1`}>
                                    <option value="all">Tümü</option>
                                    {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Sütun (Görev Listesi) */}
                <div className="w-2/3 lg:w-3/4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => (
                                        <SortableTask key={task.id} task={task} />
                                    ))
                                ) : (
                                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center text-gray-500`}>
                                        <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        Gösterilecek görev yok.
                                        <p className="text-sm">Filtreleri kontrol edin veya yeni bir görev ekleyin.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

        </div>
    );
}

export default TodoApp;