import React from 'react';
import { X, HelpCircle, Building2 } from 'lucide-react';
import { LangCode, docMatrix, reqNames } from '../i18n';

interface DocInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  visaType: string;
  reqType: string;
  currentLang: LangCode;
  onRequestCompanyDoc?: (docs: string[]) => void;
}

export const DocInfoModal: React.FC<DocInfoModalProps> = ({
  isOpen,
  onClose,
  visaType,
  reqType,
  currentLang,
  onRequestCompanyDoc
}) => {
  const [translatedField, setTranslatedField] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const docList = docMatrix[visaType]?.[reqType] || docMatrix[visaType]?.['default'] || docMatrix['E-9']?.['default'] || [];
  const companyDocs = (docList || []).filter(d => d.type === 'company');

  const handleToggleTranslate = (krName: string) => {
    if (currentLang === 'kr') return;
    setTranslatedField(translatedField === krName ? null : krName);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[170] flex items-center justify-center p-2.5 sm:p-4">
      <div className="glass-premium p-4 sm:p-6 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-blue-500/25 flex flex-col max-h-[85vh] step-container-transition relative cyber-bracket animate-[slideUpFade_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/10 pb-2.5 sm:pb-3">
          <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 glow-text-cyan animate-pulse shrink-0" />
            <span className="tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {currentLang === 'kr' ? '민원별 필요 서류 안내' : currentLang === 'en' ? 'Required Documents Guide' : 'Hướng dẫn tài liệu cần thiết'}
            </span>
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3 text-xs font-mono font-bold text-slate-300 bg-blue-950/20 p-2.5 sm:p-3 rounded-xl border border-blue-500/15 flex justify-between items-center">
          <div>
            <span className="text-cyan-400 mr-1 font-mono">[{visaType}]</span>{' '}
            <span className="text-white">{reqNames[reqType] || reqType}</span>
          </div>
          {currentLang !== 'kr' && (
            <div className="text-[9px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 animate-pulse font-mono tracking-wider">
              TAP TO TRANSLATE
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {(docList || []).map((doc, idx) => {
            let badgeStyle = '';
            let borderStyle = '';
            let labelTypeStr = '';

            if (doc.type === 'auto') {
              badgeStyle = 'bg-blue-500/20 text-blue-300 border border-blue-500/20';
              borderStyle = 'border-blue-500/10 bg-blue-500/5';
              labelTypeStr = currentLang === 'kr' ? '시스템 자동 발급' : currentLang === 'en' ? 'System Compiled' : 'Tạo tự động';
            } else if (doc.type === 'company') {
              badgeStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20';
              borderStyle = 'border-emerald-500/10 bg-emerald-500/5';
              labelTypeStr = currentLang === 'kr' ? '회사 측 준비' : currentLang === 'en' ? 'Company Provided' : 'Công ty cấp';
            } else {
              badgeStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/20';
              borderStyle = 'border-amber-500/10 bg-amber-500/5';
              labelTypeStr = currentLang === 'kr' ? '개인 직접 준비' : currentLang === 'en' ? 'Foreigner Preps' : 'Cá nhân chuẩn bị';
            }

            const isTranslated = translatedField === doc.name.kr;
            const displayedText = isTranslated ? doc.name[currentLang] : doc.name.kr;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 gap-2 ${borderStyle}`}
              >
                <span
                  onClick={() => handleToggleTranslate(doc.name.kr)}
                  className={`text-xs sm:text-sm font-semibold text-slate-350 hover:text-white leading-snug cursor-pointer select-none flex-1 transition-all duration-200 break-keep ${
                    isTranslated ? 'text-blue-400 scale-[0.99] font-extrabold' : ''
                  }`}
                >
                  {displayedText}
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <span className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-lg font-bold ${badgeStyle}`}>
                    {labelTypeStr}
                  </span>
                  {doc.type === 'company' && onRequestCompanyDoc && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestCompanyDoc([doc.name.kr]);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="회사 사장/총무에게 이 서류 발급 요청문 작성"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>요청문</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {companyDocs.length > 0 && onRequestCompanyDoc && (
          <button
            type="button"
            onClick={() => {
              onRequestCompanyDoc(companyDocs.map(d => d.name.kr));
            }}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="break-keep">회사 준비 서류 일괄 발급 요청문 작성 ({companyDocs.length}건)</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold hover:bg-white/10 transition text-xs cursor-pointer"
        >
          {currentLang === 'kr' ? '확인했습니다' : currentLang === 'en' ? 'Got it' : 'Đã hiểu'}
        </button>
      </div>
    </div>
  );
};
