package server

import (
	"encoding/json"
	"main/service/server/handle"
	"time"
)

func SandboxAutoUpdate() {
	go func() {
		ticker := time.NewTicker(5000 * time.Millisecond)
		defer ticker.Stop()
		for range ticker.C {
			if by, er := json.Marshal(handle.Sandbox_View_Last); er == nil {
				WS_Broadcast <- by
			}
		}
	}()
}
