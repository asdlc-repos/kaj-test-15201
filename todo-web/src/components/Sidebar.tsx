import { useState } from 'react';
import { Category } from '../types';
import * as api from '../api';
import CategoryItem from './CategoryItem';

interface Props {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onRefresh: () => Promise<void>;
}

export default function Sidebar({ categories, selectedCategoryId, onSelectCategory, onRefresh }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await api.createCategory({ name });
      setNewName('');
      setAdding(false);
      await onRefresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <span className="text-lg font-bold text-gray-800">📋 Todo App</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* All Tasks option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
            selectedCategoryId === null
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Tasks
        </button>

        {/* Category list */}
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            isSelected={selectedCategoryId === cat.id}
            onSelect={() => onSelectCategory(cat.id)}
            onRefresh={onRefresh}
            onDeleted={() => {
              if (selectedCategoryId === cat.id) onSelectCategory(null);
            }}
          />
        ))}
      </nav>

      {/* Add category */}
      <div className="px-2 py-3 border-t border-gray-200">
        {adding ? (
          <form onSubmit={handleAddCategory} className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              disabled={addLoading}
            />
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLoading || !newName.trim()}
                className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {addLoading ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewName(''); setAddError(null); }}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Category</span>
          </button>
        )}
      </div>
    </div>
  );
}
