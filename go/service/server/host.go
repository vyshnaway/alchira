package main

// import (
// 	"fmt"
// 	"log"
// 	"net/http"
// )

// // Custom API handler within the same module
// func apiHandler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "API call received: path = %s", r.URL.Path)
// }

// // Main entrypoint
// func main() {
// 	// Serve static files from ./website directory
// 	http.Handle("/", http.FileServer(http.Dir("website")))

// 	// Handle API requests under /api/
// 	http.HandleFunc("/api/", apiHandler)

// 	port := ":8080"
// 	log.Printf("Serving website and API at http://localhost%s", port)
// 	log.Fatal(http.ListenAndServe(port, nil))
// }
