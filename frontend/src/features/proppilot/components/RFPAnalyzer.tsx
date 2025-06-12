'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Already added
import { Label } from '@/components/ui/label'; // To be added
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Already added

interface ExtractedRequirement {
  id: string;
  text: string;
  status: 'pending' | 'extracted';
}

export default function RFPAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);
    setExtractedRequirements([]);
    if (fileRejections.length > 0) {
      let message = "File upload error. Reasons: ";
      fileRejections.forEach(rejection => {
        rejection.errors.forEach(err => {
          if (err.code === "file-too-large") {
            message += `File is larger than 10MB. `;
          } else if (err.code === "file-invalid-type") {
            message += `Invalid file type (only PDF, DOCX). `;
          } else {
            message += `${err.message}. `;
          }
        });
      });
      setError(message.trim() + ` Rejected ${fileRejections.length} file(s).`);
      setUploadedFile(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleProcessRFP = () => {
    if (!uploadedFile) {
      setError('Please upload a file first.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setExtractedRequirements([]);

    // Simulate processing delay and mock extraction
    setTimeout(() => {
      const mockReqs: ExtractedRequirement[] = [
        { id: 'req1', text: 'The system must support single sign-on (SSO).', status: 'extracted' },
        { id: 'req2', text: 'User data must be encrypted at rest and in transit.', status: 'extracted' },
        { id: 'req3', text: 'The solution should provide role-based access control.', status: 'extracted' },
        { id: 'req4', text: 'A detailed audit trail of all user actions is required.', status: 'extracted' },
      ];
      setExtractedRequirements(mockReqs);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>RFP Analyzer</CardTitle>
        <CardDescription>Upload your RFP document (PDF or DOCX, max 10MB) to extract requirements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-md cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'}
            transition-colors`}
        >
          <input {...getInputProps()} />
          {uploadedFile ? (
            <p className="text-center text-sm text-foreground">
              Selected file: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          ) : isDragActive ? (
            <p className="text-center text-sm text-primary">Drop the file here ...</p>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Drag & drop your RFP file here, or click to select file
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* File input using Label and Input for non-JS or specific styling (optional here as dropzone handles it) */}
        {/*
        <div>
          <Label htmlFor="rfp-file-input">Or select file manually:</Label>
          <Input
            id="rfp-file-input"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // Manually trigger onDrop logic or a simplified version
                onDrop([e.target.files[0]], []);
              }
            }}
            className="mt-1"
          />
        </div>
        */}

        {uploadedFile && !isProcessing && extractedRequirements.length === 0 && (
          <div className="text-center">
            <Button onClick={handleProcessRFP} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Process ${uploadedFile.name}`}
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center">
            <p className="text-sm text-primary">Analyzing document, please wait...</p>
            {/* Consider adding a spinner component here in the future */}
          </div>
        )}

        {extractedRequirements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Extracted Requirements (Mock):</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {extractedRequirements.map((req) => (
                <li key={req.id} className={req.status === 'extracted' ? 'text-green-600' : 'text-foreground'}>
                  {req.text}
                </li>
              ))}
            </ul>
            {/* Option to clear / re-upload */}
            <div className="text-center pt-4">
                <Button variant="outline" onClick={() => {
                    setUploadedFile(null);
                    setExtractedRequirements([]);
                    setError(null);
                }}>Upload another RFP</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
