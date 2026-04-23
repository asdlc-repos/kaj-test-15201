import { useState, useEffect, useCallback } from 'react';
import { Category, Task } from './types';
import * as api from './api';
import Sidebar from './components/Sidebar';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cats, tsks] = await Promise.all([
        api.fetchCategories(),
        api.fetchTasks(),
      ]);
      setCategories(cats);
      setTasks(tsks);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTasks = selectedCategoryId
    ? tasks.filter((t) => t.categoryId === selectedCategoryId)
    : tasks;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setSidebarOpen(false);
          }}
          onRefresh={loadData}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-indigo-600">
            {selectedCategoryId
              ? categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Tasks'
              : 'All Tasks'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
              <button
                className="ml-3 text-sm underline"
                onClick={loadData}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <AddTaskForm
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onTaskCreated={loadData}
              />
              <TaskList
                tasks={filteredTasks}
                categories={categories}
                showGrouped={!selectedCategoryId}
                onRefresh={loadData}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
