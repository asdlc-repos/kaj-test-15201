import { Task, Category } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  categories: Category[];
  showGrouped: boolean;
  onRefresh: () => Promise<void>;
}

export default function TaskList({ tasks, categories, showGrouped, onRefresh }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No tasks yet</p>
        <p className="text-sm mt-1">Add a task above to get started</p>
      </div>
    );
  }

  if (!showGrouped) {
    return (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            categories={categories}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    );
  }

  // Group tasks by category
  const uncategorised = tasks.filter((t) => !t.categoryId);
  const byCat: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (task.categoryId) {
      if (!byCat[task.categoryId]) byCat[task.categoryId] = [];
      byCat[task.categoryId].push(task);
    }
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catTasks = byCat[cat.id];
        if (!catTasks || catTasks.length === 0) return null;
        return (
          <div key={cat.id}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {cat.name}
            </h3>
            <div className="space-y-2">
              {catTasks.map((task) => (
                <TaskItem key={task.id} task={task} categories={categories} onRefresh={onRefresh} />
              ))}
            </div>
          </div>
        );
      })}
      {uncategorised.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Uncategorised
          </h3>
          <div className="space-y-2">
            {uncategorised.map((task) => (
              <TaskItem key={task.id} task={task} categories={categories} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
