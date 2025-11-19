// hooks/useDocumentExport.js
import { useState } from "react";
import { toast } from "react-hot-toast"; // hoặc sonner

export function useDocumentExport() {
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const [downloadingWord, setDownloadingWord] = useState(null);
  const [error, setError] = useState(null);

  const downloadDocument = async (documentId, format = 'pdf') => {
    const formats = {
      pdf: {
        endpoint: `/api/document/pdf/${documentId}`,
        extension: 'pdf',
        setter: setDownloadingPdf,
        label: 'PDF',
      },
      word: {
        endpoint: `/api/document/word/${documentId}`,
        extension: 'docx',
        setter: setDownloadingWord,
        label: 'Word',
      },
    };

    const config = formats[format];
    if (!config) {
      const errorMsg = `Unsupported format: ${format}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    config.setter(documentId);
    setError(null);

    try {
      const response = await fetch(config.endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${documentId}.${config.extension}`;
      document.body.appendChild(a); // Better browser support
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${config.label} downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      const errorMsg = `Failed to download ${config.label}`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      config.setter(null);
    }
  };

  const downloadPDF = (documentId) => downloadDocument(documentId, 'pdf');
  const downloadWord = (documentId) => downloadDocument(documentId, 'word');

  // Reset error
  const clearError = () => setError(null);

  return {
    downloadPDF,
    downloadWord,
    downloadingPdf,
    downloadingWord,
    isDownloading: downloadingPdf !== null || downloadingWord !== null,
    error,
    clearError,
  };
}