import React from "react";
import { File as FileIcon, Download } from "lucide-react";

// --- 1. CSS Styles ---
export const customStyles = `
  .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #2563eb; margin: 0; }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f1f5f9; }
  .rdp-day { color: #0f172a !important; font-weight: 600; font-size: 0.9rem; }
  .rdp-day_outside { opacity: 0.3; }
  .rdp-day_selected:not(.rdp-day_range_middle) { 
      background-color: #2563eb !important; 
      color: white !important; 
      border-radius: 50%;
  }
  .rdp-day_range_middle { 
      background-color: #dbeafe !important; 
      color: #1e40af !important;
      border-radius: 0 !important;
  }
  .rdp-day_range_start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
  .rdp-day_range_end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
  .rdp-caption_label { color: #1e293b; font-weight: 800; font-size: 1rem; }
  .rdp-head_cell { color: #334155 !important; font-weight: 700 !important; text-transform: uppercase; font-size: 0.75rem; opacity: 1 !important; }
  .rdp-weeknumber, .rdp-head_row { opacity: 1 !important; }
`;

// Helper: Extract Filename for display from a single file string
export const getFileNameFromCode = (code: string) => {
  const match = /\[file::(.*?)::/.exec(code);
  return match ? match[1] : "Unknown File";
};

// Helper: Render Comment Content (Download Links)
export const renderCommentContent = (text: string) => {
  const fileRegex = /\[file::(.*?)::(.*?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = fileRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Render text before the file (trim newlines if it's just spacing)
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }
    const fileName = match[1];
    const fileData = match[2];
    parts.push(
      <div key={`file-${match.index}`} className="block my-1">
        <a
          href={fileData}
          download={fileName}
          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 transition-colors font-semibold no-underline"
        >
          <FileIcon size={16} />
          {fileName}
          <Download size={14} className="ml-1 opacity-50" />
        </a>
      </div>
    );
    lastIndex = fileRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : text;
};
