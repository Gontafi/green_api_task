package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading environment variables file: %v", err)
	}

	apiURL := os.Getenv("API_URL")
	log.Println(apiURL)

	URL, err := url.Parse(apiURL)
	if err != nil {
		log.Fatalf("Failed to parse target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(URL)

	fs := http.FileServer(http.Dir("views"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		log.Println(r.URL.String())
		proxy.ServeHTTP(w, r)
	})

	http.HandleFunc("/home", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("views", "index.html"))
	})

	http.HandleFunc("/getContentType", func(w http.ResponseWriter, r *http.Request) {
		fileURL := r.URL.Query().Get("url")
		contentDisposition, err := getContentDisposition(fileURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get content type: %v", err), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(contentDisposition))
	})

	log.Println("Starting server on :8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getContentDisposition(url string) (string, error) {
	resp, err := http.Head(url)
	if err != nil {
		return "", fmt.Errorf("failed to fetch headers: %v", err)
	}
	defer resp.Body.Close()

	contentDisposition := resp.Header.Get("Content-Disposition")
	if contentDisposition == "" {
		return "", fmt.Errorf("content type header not found")
	}

	return contentDisposition, nil
}
