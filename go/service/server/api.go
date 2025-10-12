package server

import (
    "fmt"
    "log"
    "net/http"
)

// Handler for custom API requests
func apiHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Request received: %s\n", r.URL.Path)
}

// Main function
func main() {
    // Serve files from "./website" at /
    fs := http.FileServer(http.Dir("../../website"))
    http.Handle("/", fs)

    // Add handler for API requests
    http.HandleFunc("/api/", apiHandler)

    // Start the server on port 8080
    log.Println("Serving on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
