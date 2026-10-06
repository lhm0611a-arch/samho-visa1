import React, { useState } from 'react';
import { X, Download, Printer, Eye, ExternalLink, Check, ZoomIn, ZoomOut, FileText } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title: string;
  filename?: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title,
  filename = '출입국_서식.pdf'
}) => {
  const [zoom, setZoom] = useState<number>(100);

  if (!isOpen || !pdfUrl) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      } catch (e) {
        console.warn('Iframe print error, falling back to new window:', e);
      }
    }
    const win = window.open(pdfUrl, '_blank');
    if (win) {
      win.focus();
      win.print();
    }
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#0f1118] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#151824] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  실시간 서식 미리보기
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">출입국 법정 표준 양식 대조</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {title}
              </h3>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold transition border border-white/10 flex items-center gap-1.5 cursor-pointer"
              title="즉시 인쇄"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">인쇄</span>
            </button>

            <a
              href={pdfUrl}
              download={filename}
              className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
              title="PDF 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>다운로드</span>
            </a>

            <button
              onClick={handleOpenNewTab}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="새 탭에서 열기"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-[#1a1c26] relative overflow-hidden flex flex-col items-center justify-center p-1 sm:p-3">
          <iframe
            id="pdf-preview-iframe"
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full rounded-xl bg-white border border-white/10 shadow-lg"
            title="PDF Document Preview"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#12141d] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>법정 서식 기재 완료 · 관공서 규격 인쇄 가능</span>
          </div>
          <span className="text-slate-500 font-mono hidden sm:inline">{filename}</span>
        </div>

      </div>
    </div>
  );
};
