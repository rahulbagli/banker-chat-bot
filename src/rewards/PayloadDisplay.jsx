import { useState } from "react";

function PayloadDisplay({ nodeId, nodeName, payload, type = "request" }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!payload) return null;

  const payloadString = typeof payload === "string" 
    ? payload 
    : JSON.stringify(payload, null, 2);
  
  const lines = payloadString.split('\n');
  const previewLines = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "10px",
      padding: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      marginBottom: "15px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
      }}>
        <div>
          <div style={{ 
            fontSize: "11px", 
            color: "#777", 
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {type === "request" ? "Request Payload" : "Response Payload"}
          </div>
          <div style={{ 
            fontSize: "13px", 
            color: "#374151", 
            fontWeight: "600",
            marginTop: "4px"
          }}>
            {nodeName || `Node ${nodeId}`}
          </div>
        </div>
        
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "6px 12px",
              background: expanded ? "#667eea" : "#f3f4f6",
              color: expanded ? "#fff" : "#374151",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      <div style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        padding: "12px",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#1f2937",
        maxHeight: expanded ? "400px" : "80px",
        overflow: "auto",
        transition: "max-height 0.3s ease",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }}>
        {expanded ? payloadString : previewLines}
        {!expanded && hasMore && (
          <div style={{ 
            color: "#9ca3af", 
            fontSize: "11px",
            marginTop: "4px",
            fontStyle: "italic"
          }}>
            ... ({lines.length - 3} more lines)
          </div>
        )}
      </div>
    </div>
  );
}

export default PayloadDisplay;
