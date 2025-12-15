package order

import (
	_bytes "bytes"
	_context "context"
	_json "encoding/json"
	_io "io"
	_config "main/configs"
	_model "main/models"
	_crypto "main/package/crypto"
	_util "main/package/utils"
	_http "net/http"
	_time "time"
)

// t_ApiRequest represents the request payload sent to the worker API
type t_ApiRequest struct {
	Access  string `json:"access"`
	Private string `json:"private"`
	Content string `json:"content"`
	Archive string `json:"artifact"`
}

// t_ApiResponse represents the response from the worker API
type t_ApiResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message,omitempty"`
	Result  string `json:"result,omitempty"`
}

// R_Optimize represents the response structure
type R_Optimize struct {
	Status  bool       `json:"status"`
	Message string     `json:"message"`
	Result  *R_Preview `json:"result"`
}

// Optimize processes sequences for either preview or publish operations
func Optimize(
	sequences [][]int,
	publish bool,
	argument string,
	artifact *_model.Config_Archive,
) (*R_Optimize, error) {

	// Initialize response with preview defaults
	response := &R_Optimize{
		Status:  !publish,
		Message: "Preview Build",
		Result:  Preview(sequences, false),
	}

	if !publish {
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
	sequencesJSON, err := _json.Marshal(sequences)
	if err != nil {
		response.Message = "Failed to serialize sequences. Fallback: preview"
		return response, nil
	}

	contentCrypt, err := _crypto.SymGencrypt(string(sequencesJSON))
	if err != nil {
		response.Message = "Failed to encrypt content. Fallback: preview"
		return response, nil
	}

	// Create the payload for asymmetric encryption
	asymPayload := projectId + contentCrypt.IV + contentCrypt.Key

	// Perform asymmetric encryption
	asymEncrypted, err := _crypto.AsymEncrypt(asymPayload, publicKey)
	if err != nil {
		response.Message = "Invalid Key. Fallback: preview"
		return response, nil
	}

	artifactData, _ := _json.Marshal(artifact)
	// if err != nil {
	// handleerror(e.g., log, return, panic)
	// }

	// Prepare the request payload
	requestData := t_ApiRequest{
		Access:  publicKey,
		Private: asymEncrypted,
		Content: contentCrypt.Data,
		Archive: string(artifactData),
	}

	// Marshal request data to JSON
	requestBody, err := _json.Marshal(requestData)
	if err != nil {
		response.Message = "Failed to prepare request. Fallback: preview"
		return response, nil
	}

	// Create HTTP client with timeout
	client := &_http.Client{
		Timeout: 30 * _time.Second,
	}

	// Create the HTTP request with context
	ctx, cancel := _context.WithTimeout(_context.Background(), 25*_time.Second)
	defer cancel()

	req, err := _http.NewRequestWithContext(
		ctx,
		"POST",
		_config.Root.Url.Worker,
		_bytes.NewBuffer(requestBody),
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
	responseBody, err := _io.ReadAll(resp.Body)
	if err != nil {
		response.Message = "Failed to read server response. Fallback: preview"
		return response, nil
	}

	// Parse the worker response
	var workerResp t_ApiResponse
	if res, err := _util.Code_JsoncParse[t_ApiResponse](string(responseBody)); err == nil {
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
		decryptedResult, err := _crypto.SymDecrypt(
			workerResp.Result,
			contentCrypt.Key,
			contentCrypt.IV,
		)
		if err != nil {
			response.Message = "Failed to decrypt server response. Fallback: preview"
			return response, nil
		}

		// Parse the decrypted result
		var sortedOutput R_Preview
		if res, err := _util.Code_JsoncParse[R_Preview](decryptedResult); err == nil {
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
