import React, { useState, useEffect } from 'react';
import { FileUp, CheckCircle, RotateCcw, X, Info, Download, FileText, Edit3, Plus } from 'lucide-react';
import { LangCode } from '../i18n';
import { CustomDocItem, BUILTIN_PRESET_DOCS } from '../constants/formConstants';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  onOpenDebugDoc?: (docId: string) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenDebugDoc
}) => {
  const [templateStatus, setTemplateStatus] = useState<Record<string, boolean>>({});
  const [customDocs, setCustomDocs] = useState<CustomDocItem[]>([]);

  const checkStatus = () => {
    let loadedCustomDocs: CustomDocItem[] = [];
    try {
      const saved = localStorage.getItem('customDocRegistry');
      if (saved) {
        loadedCustomDocs = JSON.parse(saved);
      } else {
        loadedCustomDocs = [...BUILTIN_PRESET_DOCS];
      }
    } catch (e) {
      console.error(e);
      loadedCustomDocs = [...BUILTIN_PRESET_DOCS];
    }
    setCustomDocs(loadedCustomDocs);

    const statusMap: Record<string, boolean> = {
      main: !!localStorage.getItem('visaPdfTemplate_main'),
      residence: !!localStorage.getItem('visaPdfTemplate_residence'),
      guarantee: !!localStorage.getItem('visaPdfTemplate_guarantee'),
      income: !!localStorage.getItem('visaPdfTemplate_income')
    };

    loadedCustomDocs.forEach(d => {
      statusMap[d.id] = !!localStorage.getItem(`visaPdfTemplate_${d.id}`);
    });

    setTemplateStatus(statusMap);
  };

  useEffect(() => {
    if (isOpen) checkStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (docId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      localStorage.setItem(`visaPdfTemplate_${docId}`, b64);
      checkStatus();
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResetTemplate = (docId: string) => {
    localStorage.removeItem(`visaPdfTemplate_${docId}`);
    checkStatus();
  };

  const defaultDocs = [
    {
      id: 'income',
      title: '외국인 직업 및 연간 소득금액 신고서',
      desc: '법무부 출입국 외국인 직업 및 연간소득 신고 법정 양식 PDF',
      isCustom: !!templateStatus.income
    },
    {
      id: 'main',
      title: '통합신청서 (별지 제34호 서식)',
      desc: '출입국·외국인관서 제출용 표준 통합신청서 원본 PDF',
      isCustom: !!templateStatus.main
    },
    {
      id: 'residence',
      title: '거주/숙소제공 확인서',
      desc: '체류지 입증용 숙소 제공 확인서 원본 PDF',
      isCustom: !!templateStatus.residence
    },
    {
      id: 'guarantee',
      title: '신원보증서 (별지 제129호 서식)',
      desc: '고용주 신원보증 법정 양식 PDF',
      isCustom: !!templateStatus.guarantee
    }
  ];

  const customDocsList = customDocs.map(d => ({
    id: d.id,
    title: d.title,
    desc: d.desc || '사용자 추가 등록 서식',
    isCustom: !!templateStatus[d.id],
    isUserRegistered: true
  }));

  const allDocs = [...defaultDocs, ...customDocsList];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#171a26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'kr' ? 'PDF 서식 원본 템플릿 및 신규 서류 관리' : 'PDF Template & Document Manager'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'kr' ? '공식 원본 PDF를 직접 업로드하거나 내장된 고품질 벡터 양식으로 출력할 수 있습니다.' : 'Upload official government PDF templates or use built-in vector generator.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-start gap-3 text-xs text-blue-300">
            <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <strong>하이브리드 스마트 렌더링 & 신규 서류 좌표 지원:</strong>
              <p className="mt-0.5 text-slate-300">
                별도의 PDF 파일을 업로드하지 않아도 시스템 자체 내장된 <strong>'법정 규격 벡터 서식 생성 엔진'</strong>이 작동하여 규격에 맞게 100% 정밀 출력됩니다. 법무부 최신 원본 서식을 덧씌우고 싶으시면 아래에서 PDF 파일을 업로드하세요.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {allDocs.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                    {doc.isCustom ? (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 사용자 정의 PDF 적용됨
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 내장 벡터 엔진 사용 중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{doc.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenDebugDoc && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDebugDoc(doc.id);
                      }}
                      className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      title="이 서류의 서식 편집기 열기"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>서식 편집</span>
                    </button>
                  )}

                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>PDF 업로드</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.id, file);
                      }}
                    />
                  </label>

                  {doc.isCustom && (
                    <button
                      onClick={() => handleResetTemplate(doc.id)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs transition"
                      title="내장 엔진으로 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-[#171a26] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            총 {allDocs.length}개 서식 등록됨
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
