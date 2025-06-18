"use client";

import { UploadButton } from '@/lib/uploadthing';
import styles from './FileUpload.module.css';
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Loader, FileIcon } from 'lucide-react';

interface UploadedFile {
  url: string;
  type?: string;
  name?: string;
}

interface FileUploadProps {
  onChange: (file: UploadedFile | null) => void;
  value: UploadedFile | null;
  endpoint: 'messageFile' | 'serverImage';
  onUploadComplete?: (file: UploadedFile) => void;
}

const FileUpload = ({ onChange, value, endpoint, onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const isPDF = value?.type === 'application/pdf';
  const isImage = value?.type?.startsWith('image/');

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  if (isUploading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loadingIcon} />
        <p className={styles.loadingText}>Uploading...</p>
      </div>
    );
  }

  if (value && isPDF) {
    return (
      <div className="flex items-center justify-between p-3 mt-2 rounded-md bg-background/10 w-full max-w-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileIcon className="h-8 w-8 flex-shrink-0 fill-indigo-200 stroke-indigo-400" />
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-500 underline truncate max-w-[200px]"
            title={value.name}
          >
            {value.name || value.url}
          </a>
        </div>
        <button
          onClick={handleRemove}
          className="ml-2 hover:text-red-500 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && isImage) {
    return (
      <div className="relative h-20 w-20 mt-2">
        <Image
          fill
          src={value.url}
          alt={value.name || 'upload'}
          className="rounded-full object-cover"
        />
        <button
          onClick={handleRemove}
          className={styles.removeButton}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadButton
      endpoint={endpoint}
      onUploadBegin={() => {
        setIsUploading(true);
      }}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        const file = res?.[0];
        if (file) {
          const uploadedFile = {
            url: file.url,
            type: file.type || undefined,
            name: file.name || undefined,
          };
          onChange(uploadedFile);
          if (onUploadComplete) {
            onUploadComplete(uploadedFile);
          }
        }
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false);
        console.error(error);
      }}
      appearance={{
        button: styles.uploadButton,
      }}
      content={{
        button({ ready }) {
          return ready ? (
            <>
              <Upload className={styles.uploadIcon} size={24} />
              <p className={styles.uploadText}>Upload File</p>
            </>
          ) : 'Loading...';
        },
      }}
    />
  );
};

export default FileUpload;