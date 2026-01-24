'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
    isUploading?: boolean;
    accept?: Record<string, string[]>;
    maxSize?: number;
}

export default function FileUpload({
    onFileSelect,
    selectedFile,
    onClear,
    isUploading = false,
    accept = { 'application/pdf': ['.pdf'] },
    maxSize = 20 * 1024 * 1024, // 20MB
}: FileUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
        disabled: isUploading,
    });

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-800/50'
                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">
                                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
                            </p>
                            <p className="text-sm text-dark-400 mt-1">or click to browse (max 20MB)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-dark-600 rounded-2xl p-4 bg-dark-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <p className="font-medium text-white truncate max-w-[200px] sm:max-w-none">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-dark-400">{formatSize(selectedFile.size)}</p>
                            </div>
                        </div>
                        {!isUploading && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {fileRejections.length > 0 && (
                <p className="mt-2 text-sm text-red-400">
                    {fileRejections[0].errors[0].message}
                </p>
            )}
        </div>
    );
}
