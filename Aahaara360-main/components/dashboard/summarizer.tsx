"use client"

import { useState, useRef, useEffect } from "react"
import { FileText, Upload, X, Loader2, Download, Copy, BookOpen } from "lucide-react"
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Types
interface RAGResponse {
  summary: string;
  keyPoints: string[];
  documentType: string;
}

// Simple toast implementation (remains the same)
const useToast = () => {
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '6px';
    toast.style.backgroundColor = variant === 'destructive' ? '#fef2f2' : '#f0f9ff';
    toast.style.color = variant === 'destructive' ? '#991b1b' : '#0c4a6e';
    toast.style.border = `1px solid ${variant === 'destructive' ? '#fecaca' : '#bae6fd'}`;
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    toast.style.zIndex = '1000';
    toast.style.maxWidth = '320px';
    
    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 14px;">${description}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };
  
  return { toast: showToast };
};

// Aahaara360 AI Implementation with Live Gemini API
class Aahaara360Summarizer {
  private apiKey: string;
  
  constructor() {
    // IMPORTANT: For a hackathon, this is okay. In production, move the API call to a secure server action.
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'your-gemini-api-key-here';
  }

  // -> THE FIX: This now uses pdf.js to extract real text from the PDF.
  private async extractTextFromPDF(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            return reject(new Error("Failed to read file."));
          }
          const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += '\n\n'; // Add a separator for pages
          }
          resolve(fullText.trim());
        } catch (error) {
          reject(new Error("Could not parse PDF content."));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // -> THE FIX: This now makes a real API call to the Gemini AI.
  private async callAahaara360AI(prompt: string, extractedText: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'AIzaSyAJMql7w_psGgSxYt4mcsd4Q2Y6jQq2xps') {
       throw new Error('API Key is not configured. Please add it to your environment variables.');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${this.apiKey}`;
    const fullPrompt = `${prompt}\n\n---DOCUMENT CONTENT START---\n${extractedText}\n---DOCUMENT CONTENT END---`;

    const payload = {
      contents: [{ parts: [{ text: fullPrompt }] }]
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Aahaara360 AI API error: ${errorBody.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("AI returned an empty or invalid response.");
      return text;

    } catch (error) {
      console.error('Aahaara360 AI error:', error);
      throw new Error('Failed to communicate with Aahaara360 AI. Please check your API key and try again.');
    }
  }

  // This is the main function that orchestrates the process
  async summarizeDocument(file: File): Promise<RAGResponse> {
    try {
      const extractedText = await this.extractTextFromPDF(file);
      
      // We run the AI calls in parallel for better performance
      const [summary, keyPointsResponse, documentType] = await Promise.all([
         this.callAahaara360AI("Provide a comprehensive summary of this document:", extractedText),
         this.callAahaara360AI("Extract the 5 most important key points from this document as a numbered list:", extractedText),
         this.callAahaara360AI("Classify this document (e.g., Research Paper, Medical Report, etc.):", extractedText)
      ]);
      
      const keyPoints = keyPointsResponse.split('\n').map(p => p.replace(/^\d+\.\s*/, '')).filter(p => p.trim());

      return {
        summary: summary,
        keyPoints,
        documentType
      };
      
    } catch (error) {
      console.error('Aahaara360 summarization error:', error);
      throw error; // Re-throw the error to be caught by the component
    }
  }
}

export function Summarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'summary'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const uploadedFile = files[0];
    if (uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      toast("Unsupported file type", "Please upload a PDF file", "destructive");
    }
  };

  const handleSummarize = async () => {
    if (!file) return;

    setIsLoading(true);
    setProgressMessage('Extracting text from PDF...');
    setSummary(null);
    setKeyPoints([]);
    setDocumentType('');

    try {
      const summarizer = new Aahaara360Summarizer();
      setProgressMessage('Analyzing with Aahaara360 AI...');
      const result = await summarizer.summarizeDocument(file);
      
      setSummary(result.summary);
      setKeyPoints(result.keyPoints);
      setDocumentType(result.documentType);
      setActiveTab('summary');
      
      toast("Summary generated", "Your PDF has been successfully analyzed.");
    } catch (error: any) {
      toast("Error", error.message || "Failed to generate summary.", "destructive");
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  const handleClear = () => {
    setFile(null); setSummary(null); setKeyPoints([]); setDocumentType(''); setActiveTab('upload');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    toast("Copied", "Summary has been copied to your clipboard");
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    const content = `AAHAARA360 PDF SUMMARY\n\nDocument Type: ${documentType}\n\n--- SUMMARY ---\n${summary}\n\n--- KEY POINTS ---\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
    const fileBlob = new Blob([content], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(fileBlob);
    element.download = `aahaara360-summary-${file?.name || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const Button = ({ children, onClick, disabled = false, variant = 'default', className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'default' | 'outline'; className?: string; }) => {
    return ( <button className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'default' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} ${className}`} onClick={onClick} disabled={disabled}> {children} </button> );
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col space-y-1.5 pb-6">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <BookOpen className="h-5 w-5" />
          PDF Document Analyzer
        </div>
        <p className="text-sm text-gray-500">
          Upload PDF documents to generate summaries with the Aahaara360 AI.
        </p>
      </div>

      <div className="flex mb-6 border-b">
        <button className={`px-4 py-2 font-medium text-sm ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('upload')}>
          Upload PDF
        </button>
        <button className={`px-4 py-2 font-medium text-sm ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} ${!summary ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => summary && setActiveTab('summary')} disabled={!summary}>
          Summary
        </button>
      </div>
      
      {activeTab === 'upload' ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
            {file ? (
              <div className="space-y-2">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"><FileText className="h-6 w-6 text-green-600" /></div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="font-medium">Click to upload or drag and drop</p>
              </div>
            )}
          </div>

          {file && (
            <div className="space-y-4">
              {isLoading && (
                <div className="space-y-2 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">{progressMessage}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSummarize} disabled={isLoading} className="flex-1">
                  {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> ) : ( <><FileText className="mr-2 h-4 w-4" /> Generate Summary</> )}
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isLoading}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {summary && (
            <>
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-lg">Aahaara360-Generated Summary</h4>
                    {documentType && <p className="text-sm text-gray-500">Document Type: {documentType}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopySummary}><Copy className="h-4 w-4 mr-1" />Copy</Button>
                    <Button variant="outline" onClick={handleDownloadSummary}><Download className="h-4 w-4 mr-1" />Download</Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 mb-6 p-4 bg-white rounded border max-h-60 overflow-y-auto">{summary}</div>
                {keyPoints.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-3 text-gray-800">Key Points:</h5>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 bg-white p-4 rounded border">
                      {keyPoints.map((point, index) => <li key={index} className="pl-2">{point.replace(/^\d+\.\s*/, '')}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setActiveTab('upload')}>Analyze Another PDF</Button>
                <Button variant="outline" onClick={handleClear}>Clear All</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

