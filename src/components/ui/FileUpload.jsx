import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';

const FileUpload = ({
                        onChange,
                        accept,
                        multiple = false,
                        maxSize = 5 * 1024 * 1024, // 5MB default
                        maxFiles = 10,
                        label,
                        helperText,
                        error,
                        disabled = false,
                        showPreview = true,
                        className = ''
                    }) => {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles) => {
        // Validate file size
        const validFiles = newFiles.filter(file => {
            if (file.size > maxSize) {
                alert(`${file.name} dépasse la taille maximale de ${maxSize / 1024 / 1024}MB`);
                return false;
            }
            return true;
        });

        const updatedFiles = multiple
            ? [...files, ...validFiles].slice(0, maxFiles)
            : validFiles.slice(0, 1);

        setFiles(updatedFiles);
        onChange && onChange(updatedFiles);
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onChange && onChange(updatedFiles);
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
        if (file.type.includes('pdf')) return <FileText className="w-8 h-8" />;
        return <File className="w-8 h-8" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${dragActive ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleChange}
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    className="hidden"
                />

                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                    Cliquez pour sélectionner ou glissez-déposez
                </p>
                {helperText && (
                    <p className="text-xs text-gray-500">{helperText}</p>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {/* File Preview */}
            {showPreview && files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-gray-600">
                                    {file.type.startsWith('image/') && file.size < 1024 * 1024 ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    ) : (
                                        getFileIcon(file)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="text-red-500 hover:text-red-700 ml-4"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;