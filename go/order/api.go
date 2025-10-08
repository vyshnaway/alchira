package order

import (
	_bytes_ "bytes"
	_context_ "context"
	_json_ "encoding/json"
	_io_ "io"
	_cache_ "main/cache"
	_types_ "main/types"
	"main/utils"
	_http_ "net/http"
	_time_ "time"
)

// tApi_Request represents the request payload sent to the worker API
type tApi_Request struct {
	Access  string `json:"access"`
	Private string `json:"private"`
	Content string `json:"content"`
	Archive string `json:"artifact"`
}

// tApi_Response represents the response from the worker API
type tApi_Response struct {
	Status  bool   `json:"status"`
	Message string `json:"message,omitempty"`
	Result  string `json:"result,omitempty"`
}

// tApi_Result represents the response structure
type tApi_Result struct {
	Status  bool                        `json:"status"`
	Message string                      `json:"message"`
	Result  *_types_.Refer_SortedOutput `json:"result"`
}

// Order processes sequences for either preview or publish operations
func Order(
	sequences [][]int,
	command string,
	argument string,
	artifact _types_.Config_Archive,
) (*tApi_Result, error) {

	// Initialize response with preview defaults
	response := &tApi_Result{
		Status:  command == "preview",
		Message: "Preview Build",
		Result:  Preview_Organize(sequences, true), // merge = true by default
	}

	if command != "publish" {
		return response, nil
	}

	// Validate argument length for publish command
	if len(argument) < 25 {
		response.Message = "Invalid Key. Fallback: preview"
		return response, nil
	}

	// Extract projectId and publicKey from argument
	projectId := argument[:24]
	publicKey := argument[25:]

	// Encrypt the sequences content
	sequencesJSON, err := _json_.Marshal(sequences)
	if err != nil {
		response.Message = "Failed to serialize sequences. Fallback: preview"
		return response, nil
	}

	contentCrypt, err := crypt_SymGencrypt(string(sequencesJSON))
	if err != nil {
		response.Message = "Failed to encrypt content. Fallback: preview"
		return response, nil
	}

	// Create the payload for asymmetric encryption
	asymPayload := projectId + contentCrypt.IV + contentCrypt.Key

	// Perform asymmetric encryption
	asymEncrypted, err := crypt_AsymEncrypt(asymPayload, publicKey)
	if err != nil {
		response.Message = "Invalid Key. Fallback: preview"
		return response, nil
	}

	artifactData, err := _json_.Marshal(artifact)
	if err != nil {
		// handle error (e.g., log, return, panic)
	}

	// Prepare the request payload
	requestData := tApi_Request{
		Access:  publicKey,
		Private: asymEncrypted,
		Content: contentCrypt.Data,
		Archive: string(artifactData),
	}

	// Marshal request data to JSON
	requestBody, err := _json_.Marshal(requestData)
	if err != nil {
		response.Message = "Failed to prepare request. Fallback: preview"
		return response, nil
	}

	// Create HTTP client with timeout
	client := &_http_.Client{
		Timeout: 30 * _time_.Second,
	}

	// Create the HTTP request with context
	ctx, cancel := _context_.WithTimeout(_context_.Background(), 25*_time_.Second)
	defer cancel()

	req, err := _http_.NewRequestWithContext(
		ctx,
		"POST",
		_cache_.Root.Url.Worker,
		_bytes_.NewBuffer(requestBody),
	)
	if err != nil {
		response.Message = "Failed to create request. Fallback: preview"
		return response, nil
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		response.Message = "Failed to establish connection with server. Fallback: preview"
		return response, nil
	}
	defer resp.Body.Close()

	// Read response body
	responseBody, err := _io_.ReadAll(resp.Body)
	if err != nil {
		response.Message = "Failed to read server response. Fallback: preview"
		return response, nil
	}

	// Parse the worker response
	var workerResp tApi_Response
	if res, err := utils.Code_JsonParse[tApi_Response](string(responseBody)); err == nil {
		workerResp = res
	} else {
		response.Message = "Failed to parse server response. Fallback: preview"
		return response, nil
	}

	// Update response based on worker response
	response.Status = workerResp.Status

	if workerResp.Status {
		response.Message = workerResp.Message

		// Decrypt the result
		decryptedResult, err := crypt_SymDecrypt(
			workerResp.Result,
			contentCrypt.Key,
			contentCrypt.IV,
		)
		if err != nil {
			response.Message = "Failed to decrypt server response. Fallback: preview"
			return response, nil
		}

		// Parse the decrypted result
		var sortedOutput _types_.Refer_SortedOutput
		if res, err := utils.Code_JsonParse[_types_.Refer_SortedOutput](decryptedResult); err == nil {
			sortedOutput = res
		} else {
			response.Message = "Failed to parse decrypted result. Fallback: preview"
			return response, nil
		}

		response.Result = &sortedOutput
	} else {
		if workerResp.Message != "" {
			response.Message = workerResp.Message
		} else {
			response.Message = "Failed to establish connection with server. Fallback: preview"
		}
	}

	return response, nil
}
