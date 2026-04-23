import { useState } from 'react';
import { Category } from '../types';
import * as api from '../api';

interface Props {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onRefresh: () => Promise<void>;
  onDeleted: () => void;
}

export default function CategoryItem({ category, isSelected, onSelect, onRefresh, onDeleted }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(category.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || name === category.name) {
      setRenaming(false);
      return;
    }
    setRenameLoading(true);
    setRenameError(null);
    try {
      await api.updateCategory(category.id, { name });
      setRenaming(false);
      await onRefresh();
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Failed to rename');
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteCategory(category.id);
      onDeleted();
      await onRefresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  if (showDeleteConfirm) {
    return (
      <div className="px-3 py-2 rounded-md bg-red-50 mb-1">
        <p className="text-xs text-red-700 mb-1">
          Delete <strong>{category.name}</strong>? Tasks won't be deleted — they'll become uncategorised.
        </p>
        {deleteError && <p className="text-xs text-red-600 mb-1">{deleteError}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (renaming) {
    return (
      <div className="px-1 mb-1">
        <form onSubmit={handleRename} className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            disabled={renameLoading}
          />
          <button type="submit" disabled={renameLoading} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">✓</button>
          <button type="button" onClick={() => { setRenaming(false); setNewName(category.name); setRenameError(null); }} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">✕</button>
        </form>
        {renameError && <p className="text-xs text-red-600 mt-1">{renameError}</p>}
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center rounded-md mb-1 transition-colors ${
        isSelected ? 'bg-indigo-100' : 'hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onSelect}
        className={`flex-1 text-left px-3 py-2 text-sm font-medium truncate ${
          isSelected ? 'text-indigo-700' : 'text-gray-700'
        }`}
      >
        {category.name}
      </button>
      <div className="flex items-center opacity-0 group-hover:opacity-100 pr-1 transition-opacity gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
          className="p-1 text-gray-400 hover:text-indigo-600 rounded"
          title="Rename"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
