"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {CalendarIcon, TrashIcon, PlusIcon, MoonIcon, SunIcon, SearchIcon, ChevronDown} from "lucide-react"
import { format } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Subtask {
    id: number
    text: string
    completed: boolean
}

interface Todo {
    id: number
    text: string
    completed: boolean
    category: string
    dueDate: Date | null
    priority: 'low' | 'medium' | 'high'
    subtasks: Subtask[]
    tags: string[]
}

const priorities = ['low', 'medium', 'high'] as const
const categories = ['Work', 'Personal', 'Shopping', 'Health']

const initialTodos: Todo[] = [
    {
        id: 1,
        text: "Learn React",
        completed: false,
        category: "Work",
        dueDate: new Date(2023, 5, 30),
        priority: 'high',
        subtasks: [
            { id: 11, text: "Study Hooks", completed: true },
            { id: 12, text: "Practice with a project", completed: false }
        ],
        tags: ["programming", "frontend"]
    },
    {
        id: 2,
        text: "Build a todo app",
        completed: true,
        category: "Work",
        dueDate: new Date(2023, 5, 15),
        priority: 'medium',
        subtasks: [
            { id: 21, text: "Design UI", completed: true },
            { id: 22, text: "Implement functionality", completed: true }
        ],
        tags: ["project", "react"]
    },
    {
        id: 3,
        text: "Exercise",
        completed: false,
        category: "Health",
        dueDate: new Date(2023, 5, 20),
        priority: 'low',
        subtasks: [
            { id: 31, text: "30 min cardio", completed: false },
            { id: 32, text: "15 min stretching", completed: false }
        ],
        tags: ["fitness", "health"]
    },
]

export default function Todo() {
    const [todos, setTodos] = useState<Todo[]>(initialTodos)
    const [newTodo, setNewTodo] = useState("")
    const [newCategory, setNewCategory] = useState(categories[0])
    const [newDueDate, setNewDueDate] = useState<Date | null>(null)
    const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [newTags, setNewTags] = useState("")
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
    const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all')
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'alphabetical'>('dueDate')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isAddTodoOpen, setIsAddTodoOpen] = useState(false)

    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('todos')
            if (saved) {
                setTodos(JSON.parse(saved))
            }
        }
    }, [])

    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('todos', JSON.stringify(todos))
        }
    }, [todos])

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    const addTodo = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTodo.trim() !== "") {
            setTodos([...todos, {
                id: Date.now(),
                text: newTodo,
                completed: false,
                category: newCategory,
                dueDate: newDueDate,
                priority: newPriority,
                subtasks: [],
                tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
            }])
            setNewTodo("")
            setNewCategory(categories[0])
            setNewDueDate(null)
            setNewPriority('medium')
            setNewTags("")
            setIsAddTodoOpen(false)
        }
    }

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ))
    }

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    const addSubtask = (todoId: number, subtaskText: string) => {
        setTodos(todos.map(todo =>
            todo.id === todoId
                ? { ...todo, subtasks: [...todo.subtasks, { id: Date.now(), text: subtaskText, completed: false }] }
                : todo
        ))
    }

    const toggleSubtask = (todoId: number, subtaskId: number) => {
        setTodos(todos.map(todo =>
            todo.id === todoId
                ? { ...todo, subtasks: todo.subtasks.map(subtask =>
                        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                    )}
                : todo
        ))
    }

    const deleteSubtask = (todoId: number, subtaskId: number) => {
        setTodos(todos.map(todo =>
            todo.id === todoId
                ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
                : todo
        ));
    };

    const filteredAndSortedTodos = useMemo(() => {
        return todos
            .filter(todo => {
                const matchesFilter =
                    (filter === 'all') ||
                    (filter === 'active' && !todo.completed) ||
                    (filter === 'completed' && todo.completed)
                const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter
                const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                return matchesFilter && matchesCategory && matchesSearch
            })
            .sort((a, b) => {
                if (sortBy === 'dueDate') {
                    const aTime = a.dueDate instanceof Date ? a.dueDate.getTime() : 0
                    const bTime = b.dueDate instanceof Date ? b.dueDate.getTime() : 0
                    return aTime - bTime
                } else if (sortBy === 'priority') {
                    const priorityOrder = { high: 0, medium: 1, low: 2 }
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                } else {
                    return a.text.localeCompare(b.text)
                }
            })
    }, [todos, filter, categoryFilter, searchTerm, sortBy])
    const stats = useMemo(() => {
        const total = todos.length
        const completed = todos.filter(todo => todo.completed).length
        const active = total - completed
        return { total, completed, active }
    }, [todos])

    return (
        <div className={`min-h-screen w-full bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
            <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Todo</h1>
                    <div className="flex items-center space-x-4">
                        <Dialog open={isAddTodoOpen} onOpenChange={setIsAddTodoOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Todo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="top-96">
                                <DialogHeader>
                                    <DialogTitle>Add New Todo</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={addTodo} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-todo">Todo</Label>
                                        <Input
                                            id="new-todo"
                                            value={newTodo}
                                            onChange={(e) => setNewTodo(e.target.value)}
                                            placeholder="Enter new todo"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-category">Category</Label>
                                            <Select value={newCategory} onValueChange={setNewCategory}>
                                                <SelectTrigger id="new-category">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-priority">Priority</Label>
                                            <Select value={newPriority} onValueChange={(value) => setNewPriority(value as 'low' | 'medium' | 'high')}>
                                                <SelectTrigger id="new-priority">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map(priority => (
                                                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-due-date">Due Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left">
                                                    {newDueDate ? format(newDueDate, "PP") : "Select date"}
                                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <Calendar
                                                    mode="single"
                                                    selected={newDueDate || new Date()}
                                                    onSelect={(value) => setNewDueDate(value || null)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-tags">Tags</Label>
                                        <Input
                                            id="new-tags"
                                            value={newTags}
                                            onChange={(e) => setNewTags(e.target.value)}
                                            placeholder="Enter tags separated by commas"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">Add Todo</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={isDarkMode}
                                onCheckedChange={setIsDarkMode}
                            />
                            {isDarkMode ? <MoonIcon className="h-5 w-5 text-gray-400" /> : <SunIcon className="h-5 w-5 text-gray-400" />}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex flex-wrap gap-2 ">
                            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'active' | 'completed')}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'dueDate' | 'priority' | 'alphabetical')}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dueDate">Due Date</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search todos"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full md:w-[200px]"
                            />
                        </div>
                    </div>
                    <ul className="space-y-4">
                        {filteredAndSortedTodos.map(todo => (
                            <li key={todo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                                <div className="flex items-center space-x-4">
                                    <Checkbox
                                        id={`todo-${todo.id}`}
                                        checked={todo.completed}
                                        onCheckedChange={() => toggleTodo(todo.id)}
                                    />
                                    <div className="flex-grow">
                                        <label
                                            htmlFor={`todo-${todo.id}`}
                                            className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
                                        >
                                            {todo.text}
                                        </label>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {todo.category} | Due: {todo.dueDate ? format(todo.dueDate, "PP") : 'No date'} | Priority: {todo.priority}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {todo.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Collapsible className="mt-4 ml-8">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full justify-between">
                                            Subtasks ({todo.subtasks.length})
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2">
                                        <ul className="space-y-2">
                                            {todo.subtasks.map(subtask => (
                                                <li key={subtask.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`subtask-${subtask.id}`}
                                                        checked={subtask.completed}
                                                        onCheckedChange={() => toggleSubtask(todo.id, subtask.id)}
                                                    />
                                                    <label
                                                        htmlFor={`subtask-${subtask.id}`}
                                                        className={`text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
                                                    >
                                                        {subtask.text}
                                                    </label>
                                                    <div className="flex-grow"></div>
                                                    <Button variant="ghost" size="icon"
                                                            onClick={() => deleteSubtask(todo.id, subtask.id)}>
                                                        <TrashIcon className="h-4 w-4"/>
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <Input
                                                id={`subtask-input-${todo.id}`}
                                                type="text"
                                                placeholder="New subtask"
                                                className="text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const input = e.target as HTMLInputElement
                                                        if (input.value.trim() !== "") {
                                                            addSubtask(todo.id, input.value)
                                                            input.value = ''
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}
                    </div>
                </div>
            </div>
        </div>
    )
}