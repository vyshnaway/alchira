package order_test

import (
	_order "main/internal/order"
	_model "main/models"
	_testing "testing"
)

// TestOrderPreview tests the preview operation
func TestOrderPreview(t *_testing.T) {
	// Example test data
	sequences := [][]int{
		{1, 2, 3},
		{4, 5},
		{4, 5, 7},
		{6, 7, 8, 9},
	}

	artifact := _model.Config_Archive{
		Name:    "my-project",
		Version: "1.0.0",
		Readme:  "Sample readme",
		Licence: "MIT",
	}

	// Test preview operation
	result, err := _order.Optimize(sequences, false, "", artifact)

	// Assertions
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if !result.Status {
		t.Errorf("Expected status to be true for preview, got: %t", result.Status)
	}

	expectedMessage := "Preview Build"
	if result.Message != expectedMessage {
		t.Errorf("Expected message '%s', got: '%s'", expectedMessage, result.Message)
	}

	if result.Result == nil {
		t.Fatal("Expected result to be non-nil")
	}

	if result.Result.Count <= 0 {
		t.Errorf("Expected result count to be greater than 0, got: %d", result.Result.Count)
	}

	t.Logf("Preview test passed - Status: %t, Message: %s, Count: %d",
		result.Status, result.Message, result.Result.Count)
}

// TestOrderPublishInvalidKey tests publish operation with invalid key
// func TestOrderPublishInvalidKey(t *testing.T) {
// 	sequences := [][]int{
// 		{1, 2, 3},
// 		{4, 5},
// 	}

// 	artifact := types.Config_Archive{
// 		Name:    "test-project",
// 		Version: "1.0.0",
// 		Readme:  "Test readme",
// 		Licence: "MIT",
// 	}

// 	// Test with too short key (should fallback to preview)
// 	shortKey := "short"
// 	result, err := order.Order(sequences, "publish", shortKey, artifact)

// 	if err != nil {
// 		t.Fatalf("Expected no error, got: %v", err)
// 	}

// 	// Should fallback to preview mode
// 	if result.Status {
// 		t.Errorf("Expected status to be false for invalid key, got: %t", result.Status)
// 	}

// 	expectedMessage := "Invalid Key. Fallback: preview"
// 	if result.Message != expectedMessage {
// 		t.Errorf("Expected message '%s', got: '%s'", expectedMessage, result.Message)
// 	}

// 	t.Logf("Invalid key test passed - Status: %t, Message: %s", result.Status, result.Message)
// }

// // TestOrderPublishValidKeyFormat tests publish with proper key format (but may fail on actual request)
// func TestOrderPublishValidKeyFormat(t *testing.T) {
// 	sequences := [][]int{
// 		{1, 2, 3},
// 		{4, 5},
// 	}

// 	artifact := types.Config_Archive{
// 		Name:    "test-project",
// 		Version: "1.0.0",
// 		Readme:  "Test readme",
// 		Licence: "MIT",
// 	}

// 	// Test with properly formatted key (24 + 1 + more chars)
// 	publishKey := "123456789012345678901234" + ":" + "abcdefghijklmnopqrstuvwxyz1234567890"
// 	result, err := order.Order(sequences, "publish", publishKey, artifact)

// 	if err != nil {
// 		t.Fatalf("Expected no error, got: %v", err)
// 	}

// 	// This will likely fail on actual encryption/request, but should pass key validation
// 	t.Logf("Valid key format test - Status: %t, Message: %s", result.Status, result.Message)

// 	// The result should either succeed or fail gracefully with a proper error message
// 	if result.Status {
// 		t.Logf("Publish succeeded unexpectedly")
// 	} else {
// 		// Should fail with crypto error or connection error, not key validation error
// 		if result.Message == "Invalid Key. Fallback: preview" {
// 			t.Errorf("Key validation failed when it should have passed")
// 		}
// 	}
// }

// // TestOrderAsync tests the asynchronous version
// // func TestOrderAsync(t *testing.T) {
// // 	sequences := [][]int{
// // 		{1, 2, 3},
// // 		{4, 5},
// // 		{6, 7, 8, 9},
// // 	}

// // 	artifact := types.Config_Archive{
// // 		Name:    "async-project",
// // 		Version: "2.0.0",
// // 		Readme:  "Async test readme",
// // 		Licence: "Apache-2.0",
// // 	}

// // 	// Use a channel to wait for the async operation
// // 	done := make(chan bool, 1)
// // 	var asyncResult *OrderResponse
// // 	var asyncErr error

// // 	// Test async preview operation
// // 	OrderAsync(sequences, false, "", artifact, func(resp *OrderResponse, err error) {
// // 		asyncResult = resp
// // 		asyncErr = err
// // 		done <- true
// // 	})

// // 	// Wait for async operation with timeout
// // 	select {
// // 	case <-done:
// // 		// Operation completed
// // 	case <-time.After(5 * time.Second):
// // 		t.Fatal("Async operation timed out")
// // 	}

// // 	// Assertions on async result
// // 	if asyncErr != nil {
// // 		t.Fatalf("Expected no error in async operation, got: %v", asyncErr)
// // 	}

// // 	if asyncResult == nil {
// // 		t.Fatal("Expected async result to be non-nil")
// // 	}

// // 	if !asyncResult.Status {
// // 		t.Errorf("Expected async status to be true, got: %t", asyncResult.Status)
// // 	}

// // 	expectedMessage := "Preview Build"
// // 	if asyncResult.Message != expectedMessage {
// // 		t.Errorf("Expected async message '%s', got: '%s'", expectedMessage, asyncResult.Message)
// // 	}

// // 	t.Logf("Async test passed - Status: %t, Message: %s",
// // 		asyncResult.Status, asyncResult.Message)
// // }

// // TestOrderEdgeCases tests various edge cases
// func TestOrderEdgeCases(t *testing.T) {
// 	artifact := types.Config_Archive{
// 		Name:    "edge-case-project",
// 		Version: "1.0.0",
// 		Readme:  "Edge case testing",
// 		Licence: "MIT",
// 	}

// 	// Test with empty sequences
// 	t.Run("EmptySequences", func(t *testing.T) {
// 		emptySequences := [][]int{}
// 		result, err := order.Order(emptySequences, false, "", artifact)

// 		if err != nil {
// 			t.Fatalf("Expected no error with empty sequences, got: %v", err)
// 		}

// 		if !result.Status {
// 			t.Errorf("Expected status true for empty sequences preview, got: %t", result.Status)
// 		}
// 	})

// 	// Test with single sequence
// 	t.Run("SingleSequence", func(t *testing.T) {
// 		singleSequence := [][]int{{1, 2, 3}}
// 		result, err := order.Order(singleSequence, false, "", artifact)

// 		if err != nil {
// 			t.Fatalf("Expected no error with single sequence, got: %v", err)
// 		}

// 		if !result.Status {
// 			t.Errorf("Expected status true for single sequence preview, got: %t", result.Status)
// 		}
// 	})

// 	// Test with invalid command
// 	t.Run("InvalidCommand", func(t *testing.T) {
// 		sequences := [][]int{{1, 2}}
// 		result, err := order.Order(sequences, "invalid", "", artifact)

// 		if err != nil {
// 			t.Fatalf("Expected no error with invalid command, got: %v", err)
// 		}

// 		// Should default to preview behavior (status false for non-preview commands)
// 		if result.Status {
// 			t.Errorf("Expected status false for invalid command, got: %t", result.Status)
// 		}
// 	})
// }

// // Benchmark test for performance measurement
// func BenchmarkOrderPreview(b *testing.B) {
// 	sequences := [][]int{
// 		{1, 2, 3, 4, 5},
// 		{6, 7, 8},
// 		{9, 10, 11, 12},
// 		{13, 14},
// 	}

// 	artifact := types.Config_Archive{
// 		Name:    "benchmark-project",
// 		Version: "1.0.0",
// 		Readme:  "Benchmark test",
// 		Licence: "MIT",
// 	}

// 	b.ResetTimer()
// 	for i := 0; i < b.N; i++ {
// 		_, err := order.Order(sequences, false, "", artifact)
// 		if err != nil {
// 			b.Fatalf("Benchmark failed with error: %v", err)
// 		}
// 	}
// }

// // TestTable using table-driven tests
// func TestOrderCommands(t *testing.T) {
// 	sequences := [][]int{{1, 2}, {3, 4, 5}}
// 	artifact := types.Config_Archive{Name: "test", Version: "1.0.0", Readme: "test", Licence: "MIT"}

// 	tests := []struct {
// 		name       string
// 		command    string
// 		argument   string
// 		wantStatus bool
// 	}{
// 		{
// 			name:       "Preview Command",
// 			command:    false,
// 			argument:   "",
// 			wantStatus: true,
// 		},
// 		{
// 			name:       "Publish Short Key",
// 			command:    "publish",
// 			argument:   "short",
// 			wantStatus: false,
// 		},
// 		{
// 			name:       "Empty Command",
// 			command:    "",
// 			argument:   "",
// 			wantStatus: false,
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			result, err := order.Order(sequences, tt.command, tt.argument, artifact)
// 			if err != nil {
// 				t.Fatalf("Expected no error, got: %v", err)
// 			}

// 			if result.Status != tt.wantStatus {
// 				t.Errorf("Expected status %t, got %t", tt.wantStatus, result.Status)
// 			}
// 		})
// 	}
// }
