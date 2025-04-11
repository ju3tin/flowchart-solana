export const metadataUploaderCss = `
.irys-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.connection-section,
.upload-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-tips {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.connection-tips ul {
  margin-top: 5px;
  padding-left: 20px;
}

.connection-tips li {
  margin-bottom: 5px;
}

.fund-container {
  margin-top: 10px;
}

.info-note {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #cbd5e0;
}

.info-note p {
  margin: 5px 0;
}

.info-tip {
  font-size: 13px;
  color: #718096;
  font-style: italic;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.connect-button,
.upload-button,
.fund-button,
.reset-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.connect-button {
  background-color: #4a5568;
  color: white;
}

.connect-button:hover {
  background-color: #2d3748;
}

.upload-button {
  background-color: #3182ce;
  color: white;
}

.upload-button:hover {
  background-color: #2b6cb0;
}

.fund-button {
  background-color: #38a169;
  color: white;
  margin-top: 10px;
}

.fund-button:hover {
  background-color: #2f855a;
}

.reset-button {
  background-color: #718096;
  color: white;
  margin-top: 15px;
}

.reset-button:hover {
  background-color: #4a5568;
}

.connect-button:disabled,
.upload-button:disabled,
.fund-button:disabled {
  background-color: #cbd5e0;
  color: #718096;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #ebf8ff;
  border-left: 4px solid #4299e1;
  border-radius: 4px;
}

.error-message {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
  border-radius: 4px;
  color: #c53030;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

pre {
  background-color: #f7fafc;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}

a {
  color: #3182ce;
  word-break: break-all;
} 
`;
