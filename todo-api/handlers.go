package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

// jsonError writes a JSON error response.
func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// jsonOK writes a JSON success response with the given status code.
func jsonOK(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

// corsMiddleware adds CORS headers and handles OPTIONS preflight requests.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// healthHandler handles GET /health.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonOK(w, http.StatusOK, map[string]string{"status": "ok"})
}

// --- Category handlers ---

// categoriesHandler handles GET /categories and POST /categories.
func categoriesHandler(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			cats := store.ListCategories()
			if cats == nil {
				cats = []Category{}
			}
			jsonOK(w, http.StatusOK, cats)
		case http.MethodPost:
			var body struct {
				Name string `json:"name"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				jsonError(w, "invalid JSON body", http.StatusBadRequest)
				return
			}
			if strings.TrimSpace(body.Name) == "" {
				jsonError(w, "name is required", http.StatusBadRequest)
				return
			}
			cat := store.CreateCategory(body.Name)
			jsonOK(w, http.StatusCreated, cat)
		}
	}
}

// categoryByIDHandler handles PUT /categories/{id} and DELETE /categories/{id}.
func categoryByIDHandler(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			jsonError(w, "missing category id", http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodPut:
			var body struct {
				Name string `json:"name"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				jsonError(w, "invalid JSON body", http.StatusBadRequest)
				return
			}
			if strings.TrimSpace(body.Name) == "" {
				jsonError(w, "name is required", http.StatusBadRequest)
				return
			}
			cat, ok := store.UpdateCategory(id, body.Name)
			if !ok {
				jsonError(w, "category not found", http.StatusNotFound)
				return
			}
			jsonOK(w, http.StatusOK, cat)
		case http.MethodDelete:
			if !store.DeleteCategory(id) {
				jsonError(w, "category not found", http.StatusNotFound)
				return
			}
			w.WriteHeader(http.StatusNoContent)
		}
	}
}

// --- Task handlers ---

// tasksHandler handles GET /tasks and POST /tasks.
func tasksHandler(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			categoryID := r.URL.Query().Get("categoryId")
			// Validate the filter category exists if provided.
			if categoryID != "" && !store.CategoryExists(categoryID) {
				jsonError(w, "category not found", http.StatusNotFound)
				return
			}
			tasks := store.ListTasks(categoryID)
			if tasks == nil {
				tasks = []Task{}
			}
			jsonOK(w, http.StatusOK, tasks)
		case http.MethodPost:
			var body struct {
				Title      string  `json:"title"`
				DueDate    *string `json:"dueDate"`
				CategoryID *string `json:"categoryId"`
				Completed  bool    `json:"completed"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				jsonError(w, "invalid JSON body", http.StatusBadRequest)
				return
			}
			if strings.TrimSpace(body.Title) == "" {
				jsonError(w, "title is required", http.StatusBadRequest)
				return
			}
			if body.CategoryID != nil && !store.CategoryExists(*body.CategoryID) {
				jsonError(w, "category not found", http.StatusBadRequest)
				return
			}
			task := store.CreateTask(body.Title, body.DueDate, body.CategoryID)
			if body.Completed {
				task, _ = store.SetTaskCompleted(task.ID, true)
			}
			jsonOK(w, http.StatusCreated, task)
		}
	}
}

// taskByIDHandler handles PUT /tasks/{id} and DELETE /tasks/{id}.
func taskByIDHandler(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			jsonError(w, "missing task id", http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodPut:
			var body struct {
				Title      string  `json:"title"`
				DueDate    *string `json:"dueDate"`
				CategoryID *string `json:"categoryId"`
				Completed  bool    `json:"completed"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				jsonError(w, "invalid JSON body", http.StatusBadRequest)
				return
			}
			if strings.TrimSpace(body.Title) == "" {
				jsonError(w, "title is required", http.StatusBadRequest)
				return
			}
			if body.CategoryID != nil && !store.CategoryExists(*body.CategoryID) {
				jsonError(w, "category not found", http.StatusBadRequest)
				return
			}
			task, ok := store.UpdateTask(id, body.Title, body.Completed, body.DueDate, body.CategoryID)
			if !ok {
				jsonError(w, "task not found", http.StatusNotFound)
				return
			}
			jsonOK(w, http.StatusOK, task)
		case http.MethodDelete:
			if !store.DeleteTask(id) {
				jsonError(w, "task not found", http.StatusNotFound)
				return
			}
			w.WriteHeader(http.StatusNoContent)
		}
	}
}

// taskCompleteHandler handles PATCH /tasks/{id}/complete.
func taskCompleteHandler(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			jsonError(w, "missing task id", http.StatusBadRequest)
			return
		}
		var body struct {
			Completed bool `json:"completed"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			jsonError(w, "invalid JSON body", http.StatusBadRequest)
			return
		}
		task, ok := store.SetTaskCompleted(id, body.Completed)
		if !ok {
			jsonError(w, "task not found", http.StatusNotFound)
			return
		}
		jsonOK(w, http.StatusOK, task)
	}
}
