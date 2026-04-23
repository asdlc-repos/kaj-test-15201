import { useState } from 'react';
import { Task, Category } from '../types';
import * as api from '../api';
import { isOverdue, formatDate } from '../utils';

interface Props {
  task: Task;
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export default function TaskItem({ task, categories, onRefresh }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ?? '');
  const [editCategoryId, setEditCategoryId] = useState(task.categoryId ?? '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const overdue = isOverdue(task.dueDate, task.completed);

  async function handleToggle() {
    setToggleLoading(true);
    setToggleError(null);
    try {
      await api.toggleTaskCompletion(task.id, !task.completed);
      await onRefresh();
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setToggleLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const title = editTitle.trim();
    if (!title) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await api.updateTask(task.id, {
        title,
        dueDate: editDueDate || null,
        categoryId: editCategoryId || null,
        completed: task.completed,
      });
      setEditing(false);
      await onRefresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.deleteTask(task.id);
      await onRefresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  if (editing) {
    return (
      <div className="bg-white rounded-lg border border-indigo-300 p-3 shadow-sm">
        <form onSubmit={handleEdit} className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            disabled={editLoading}
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={editLoading}
            />
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={editLoading}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {editError && <p className="text-xs text-red-600">{editError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={editLoading || !editTitle.trim()}
              className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {editLoading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditTitle(task.title);
                setEditDueDate(task.dueDate ?? '');
                setEditCategoryId(task.categoryId ?? '');
                setEditError(null);
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="bg-white rounded-lg border border-red-300 p-3 shadow-sm">
        <p className="text-sm text-gray-700 mb-2">Delete <strong>"{task.title}"</strong>?</p>
        {deleteError && <p className="text-xs text-red-600 mb-2">{deleteError}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-white rounded-lg border shadow-sm p-3 flex items-start gap-3 transition-colors ${task.completed ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-indigo-200'}`}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggleLoading}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </span>
        {toggleError && <p className="text-xs text-red-600 mt-0.5">{toggleError}</p>}
        <div className="flex flex-wrap gap-2 mt-1">
          {task.dueDate && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                overdue
                  ? 'bg-red-100 text-red-700'
                  : task.completed
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {overdue && !task.completed ? '⚠ ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
