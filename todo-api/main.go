package main

import (
	"log"
	"net/http"
)

func main() {
	store := NewStore()
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", healthHandler)

	// Categories collection
	mux.HandleFunc("GET /categories", categoriesHandler(store))
	mux.HandleFunc("POST /categories", categoriesHandler(store))

	// Categories by ID
	mux.HandleFunc("PUT /categories/{id}", categoryByIDHandler(store))
	mux.HandleFunc("DELETE /categories/{id}", categoryByIDHandler(store))
	mux.HandleFunc("OPTIONS /categories/{id}", categoryByIDHandler(store))

	// Tasks collection
	mux.HandleFunc("GET /tasks", tasksHandler(store))
	mux.HandleFunc("POST /tasks", tasksHandler(store))

	// Task completion toggle — must be registered before the generic {id} route
	mux.HandleFunc("PATCH /tasks/{id}/complete", taskCompleteHandler(store))
	mux.HandleFunc("OPTIONS /tasks/{id}/complete", taskCompleteHandler(store))

	// Tasks by ID
	mux.HandleFunc("PUT /tasks/{id}", taskByIDHandler(store))
	mux.HandleFunc("DELETE /tasks/{id}", taskByIDHandler(store))
	mux.HandleFunc("OPTIONS /tasks/{id}", taskByIDHandler(store))

	// OPTIONS for collection endpoints (preflight)
	mux.HandleFunc("OPTIONS /categories", categoriesHandler(store))
	mux.HandleFunc("OPTIONS /tasks", tasksHandler(store))

	handler := corsMiddleware(mux)

	log.Println("todo-api listening on :9090")
	if err := http.ListenAndServe(":9090", handler); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
