import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileImage,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

export const UploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const steps = [
    'Uploading document...',
    'Reading document...',
    'Extracting content & OCR...',
    'Understanding structure...',
    'Analyzing concepts...',
    'Building knowledge map...',
    'Generating insights...',
    'Analysis complete!'
  ];

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const allowed = [
      '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
      '.xls', '.xlsx', '.csv',
      '.ppt', '.pptx',
      '.jpg', '.jpeg', '.png', '.webp', '.tiff'
    ];

    if (!allowed.includes(ext)) {
      setError("This file type isn't supported yet. Allowed types: PDF, Word, Excel, CSV, PowerPoint, and Images.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File exceeds maximum allowable size limit of 50MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setCurrentStepIndex(0);
    setError('');

    // Advance progress steps visually
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.uploadDocument(formData);
      clearInterval(stepInterval);
      setCurrentStepIndex(steps.length - 1);

      setTimeout(() => {
        setIsProcessing(false);
        setFile(null);
        if (onUploadComplete) onUploadComplete(res.document);
        onClose();
      }, 700);
    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setError(err.message || 'Upload failed. Please check the file and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-slate-100">
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Upload Document</h3>
          <p className="mt-1 text-xs text-slate-400">
            PDF, Word, Spreadsheets, Presentations, and Scans with Neural OCR
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isProcessing ? (
          /* Multi-Step Animated Processing UI */
          <div className="py-6 px-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <h4 className="text-base font-bold text-white mb-1">{steps[currentStepIndex]}</h4>
            <p className="text-xs text-slate-400 mb-6">
              Analyzing structure, extracting entities and preparing knowledge graph...
            </p>

            {/* Step Indicators */}
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {steps.map((stepName, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : idx === currentStepIndex ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`${
                      idx === currentStepIndex
                        ? 'font-bold text-white'
                        : idx < currentStepIndex
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          /* File Upload Drop Zone */
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.tiff"
              />

              <div className="flex justify-center gap-3 text-slate-500 mb-4">
                <FileText className="w-6 h-6 text-indigo-400" />
                <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                <Presentation className="w-6 h-6 text-purple-400" />
                <FileImage className="w-6 h-6 text-teal-400" />
              </div>

              {file ? (
                <div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Selected File
                  </span>
                  <p className="mt-2 text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white">Drag & drop your file here, or browse</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, Word, Excel, PPT, TXT, Scans up to 50MB</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!file}
                onClick={handleStartUpload}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-40"
              >
                Start AI Ingestion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
