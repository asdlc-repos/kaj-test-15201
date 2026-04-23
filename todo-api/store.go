package main

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// Category represents a task category.
type Category struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}

// Task represents a to-do task.
type Task struct {
	ID         string    `json:"id"`
	Title      string    `json:"title"`
	Completed  bool      `json:"completed"`
	DueDate    *string   `json:"dueDate"`
	CategoryID *string   `json:"categoryId"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// Store holds all in-memory state protected by a RWMutex.
type Store struct {
	mu         sync.RWMutex
	categories map[string]Category
	tasks      map[string]Task
}

// NewStore creates and returns a new empty Store.
func NewStore() *Store {
	return &Store{
		categories: make(map[string]Category),
		tasks:      make(map[string]Task),
	}
}

// --- Category methods ---

// ListCategories returns all categories as a slice.
func (s *Store) ListCategories() []Category {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]Category, 0, len(s.categories))
	for _, c := range s.categories {
		result = append(result, c)
	}
	return result
}

// CreateCategory creates a new category with the given name.
func (s *Store) CreateCategory(name string) Category {
	c := Category{
		ID:        uuid.New().String(),
		Name:      name,
		CreatedAt: time.Now().UTC(),
	}
	s.mu.Lock()
	s.categories[c.ID] = c
	s.mu.Unlock()
	return c
}

// UpdateCategory updates the name of an existing category. Returns (Category, true) on success
// or (Category{}, false) if not found.
func (s *Store) UpdateCategory(id, name string) (Category, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.categories[id]
	if !ok {
		return Category{}, false
	}
	c.Name = name
	s.categories[id] = c
	return c, true
}

// DeleteCategory removes the category and nullifies categoryId on all related tasks.
func (s *Store) DeleteCategory(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.categories[id]; !ok {
		return false
	}
	delete(s.categories, id)
	// Nullify categoryId on tasks that belonged to this category.
	for tid, t := range s.tasks {
		if t.CategoryID != nil && *t.CategoryID == id {
			t.CategoryID = nil
			t.UpdatedAt = time.Now().UTC()
			s.tasks[tid] = t
		}
	}
	return true
}

// CategoryExists returns true if a category with the given id exists.
func (s *Store) CategoryExists(id string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.categories[id]
	return ok
}

// --- Task methods ---

// ListTasks returns all tasks, optionally filtered by categoryId.
// Pass an empty string to return all tasks.
func (s *Store) ListTasks(categoryID string) []Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]Task, 0, len(s.tasks))
	for _, t := range s.tasks {
		if categoryID == "" || (t.CategoryID != nil && *t.CategoryID == categoryID) {
			result = append(result, t)
		}
	}
	return result
}

// CreateTask creates a new task.
func (s *Store) CreateTask(title string, dueDate, categoryID *string) Task {
	now := time.Now().UTC()
	t := Task{
		ID:         uuid.New().String(),
		Title:      title,
		Completed:  false,
		DueDate:    dueDate,
		CategoryID: categoryID,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	s.mu.Lock()
	s.tasks[t.ID] = t
	s.mu.Unlock()
	return t
}

// UpdateTask replaces all mutable fields on an existing task.
func (s *Store) UpdateTask(id, title string, completed bool, dueDate, categoryID *string) (Task, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[id]
	if !ok {
		return Task{}, false
	}
	t.Title = title
	t.Completed = completed
	t.DueDate = dueDate
	t.CategoryID = categoryID
	t.UpdatedAt = time.Now().UTC()
	s.tasks[id] = t
	return t, true
}

// DeleteTask removes a task. Returns true on success, false if not found.
func (s *Store) DeleteTask(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tasks[id]; !ok {
		return false
	}
	delete(s.tasks, id)
	return true
}

// SetTaskCompleted updates the completed field of a task.
func (s *Store) SetTaskCompleted(id string, completed bool) (Task, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[id]
	if !ok {
		return Task{}, false
	}
	t.Completed = completed
	t.UpdatedAt = time.Now().UTC()
	s.tasks[id] = t
	return t, true
}
