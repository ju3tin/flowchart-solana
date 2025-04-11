export const metadataUploaderComponent = `
import React, { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WebIrys } from '@irys/sdk';
import './MetadataUploader.css';
import {
  initializeWebIrys,
  getIrysBalance,
  uploadFileToIrys,
  uploadMetadataToIrys,
  fundIrysWallet
} from '../utils/metadataUploaderUtils';

const MetadataUploader: React.FC = () => {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [fileUri, setFileUri] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [error, setError] = useState('');
  const [webIrys, setWebIrys] = useState<WebIrys | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      const irys = await initializeWebIrys(wallet);
      setWebIrys(irys);
      
      if (irys) {
        const balanceStr = await getIrysBalance(irys);
        setBalance(balanceStr);
      }
    } catch (err) {
      console.error('Error connecting to Irys:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileUri('');
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      // Initialize WebIrys if not already done
      let irys = webIrys;
      if (!irys) {
        irys = await initializeWebIrys(wallet);
        setWebIrys(irys);
      }
      
      if (!irys) {
        throw new Error('Failed to initialize connection');
      }
      
      // Upload the file
      const uri = await uploadFileToIrys(irys, file);
      setFileUri(uri);
      
      // Update the balance
      const newBalance = await getIrysBalance(irys);
      setBalance(newBalance);
    } catch (err) {
      console.error('Error in handleUploadFile:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadMetadata = async () => {
    if (!fileUri) {
      setError('Please upload a file first');
      return;
    }

    if (!name || !description) {
      setError('Please provide a name and description');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      // Initialize WebIrys if not already done
      let irys = webIrys;
      if (!irys) {
        irys = await initializeWebIrys(wallet);
        setWebIrys(irys);
      }
      
      if (!irys) {
        throw new Error('Failed to initialize connection');
      }
      
      // Upload the metadata
      const uri = await uploadMetadataToIrys(irys, name, description, fileUri);
      setMetadataUri(uri);
      
      // Update the balance
      const newBalance = await getIrysBalance(irys);
      setBalance(newBalance);
    } catch (err) {
      console.error('Error in handleUploadMetadata:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!webIrys) {
      setError('Please connect to Irys first');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      await fundIrysWallet(webIrys);
      
      // Update the balance
      const newBalance = await getIrysBalance(webIrys);
      setBalance(newBalance);
    } catch (err) {
      console.error('Error in handleFundWallet:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName('');
    setDescription('');
    setFileUri('');
    setMetadataUri('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!connected) {
    return (
      <div className="irys-uploader">
        <h2>Upload to Irys</h2>
        <p>Please connect your wallet to continue.</p>
      </div>
    );
  }

  return (
    <div className="irys-uploader">
      <h2>Upload to Irys</h2>
      
      {/* Connection section */}
      <div className="connection-section">
        {!webIrys ? (
          <>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-button"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Irys'}
            </button>
            <div className="connection-tips">
              <p><strong>Tips for a successful connection:</strong></p>
              <ul>
                <li>Make sure you have SOL in your wallet on Solana devnet</li>
                <li>Some corporate networks may block blockchain RPC connections</li>
                <li>If connection fails, try refreshing the page</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="connection-info">
            <p>Connected to Irys</p>
            <p>Wallet: {publicKey?.toString().substring(0, 6)}...{publicKey?.toString().substring(publicKey.toString().length - 6)}</p>
            <p>Irys Balance: {balance} SOL <span className="info-tip">(separate from your wallet balance)</span></p>
            <div className="fund-container">
              <button onClick={handleFundWallet} className="fund-button" disabled={isUploading}>
                Fund Upload Balance (0.005 SOL)
              </button>
              <div className="info-note">
                <p>Funding adds SOL to your Irys balance for storage payments.</p>
                <p>If funding fails, it may be due to network congestion or RPC limitations.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {webIrys && (
        <>
          <div className="upload-section">
            <h3>Step 1: Upload File</h3>
            <div className="form-group">
              <label htmlFor="file">Select Image:</label>
              <input 
                type="file" 
                id="file" 
                onChange={handleFileChange} 
                disabled={isUploading || !!fileUri}
                ref={fileInputRef}
                accept="image/*"
              />
            </div>
            
            {file && !fileUri && (
              <button 
                onClick={handleUploadFile} 
                disabled={isUploading || !file}
                className="upload-button"
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            )}
            
            {fileUri && (
              <div className="success-message">
                <p>File uploaded successfully!</p>
                <p>URI: <a href={fileUri} target="_blank" rel="noopener noreferrer">{fileUri}</a></p>
              </div>
            )}
          </div>
          
          {fileUri && !metadataUri && (
            <div className="upload-section">
              <h3>Step 2: Upload Metadata</h3>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input 
                  type="text" 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={isUploading || !!metadataUri}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  disabled={isUploading || !!metadataUri}
                />
              </div>
              
              <button 
                onClick={handleUploadMetadata} 
                disabled={isUploading || !name || !description}
                className="upload-button"
              >
                {isUploading ? 'Uploading...' : 'Upload Metadata'}
              </button>
            </div>
          )}
          
          {metadataUri && (
            <div className="success-message">
              <h3>Upload Complete!</h3>
              <p>Metadata URI: <a href={metadataUri} target="_blank" rel="noopener noreferrer">{metadataUri}</a></p>
              <p>You can now use this URI to mint an NFT:</p>
              <pre>{metadataUri}</pre>
              <button onClick={resetForm} className="reset-button">Start New Upload</button>
            </div>
          )}
        </>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MetadataUploader;


`
