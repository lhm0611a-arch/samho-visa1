import React, { useState } from 'react';
import { X, HelpCircle, Building2, CheckCircle2 } from 'lucide-react';
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
  const [translatedField, setTranslatedField] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve strictly the documents required for this visa and this petition
  const docList = 
    docMatrix[visaType]?.[reqType] || 
    docMatrix[visaType]?.['default'] || 
    docMatrix['E-9']?.[reqType] || 
    docMatrix['E-9']?.['default'] || 
    [];

  const countAuto = docList.filter(d => d.type === 'auto').length;
  const countCompany = docList.filter(d => d.type === 'company').length;
  const countPersonal = docList.filter(d => d.type === 'personal').length;
  const companyDocs = docList.filter(d => d.type === 'company');

  const petitionName = reqNames[reqType] || reqType;

  const handleToggleTranslate = (krName: string) => {
    if (currentLang === 'kr') return;
    setTranslatedField(translatedField === krName ? null : krName);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[170] flex items-center justify-center p-3 sm:p-4">
      <div className="glass-premium p-4 sm:p-6 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.85)] border border-blue-500/25 flex flex-col max-h-[88vh] step-container-transition relative cyber-bracket animate-[slideUpFade_0.35s_ease-out]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-cyan-400 glow-text-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-600/30 text-cyan-300 border border-blue-400/30">
                  {visaType}
                </span>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight">
                  {petitionName} 필요 서류
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentLang === 'kr' 
                  ? '해당 민원 접수 시 출입국·외국인관서에 제출해야 하는 법정 서류 일체입니다.' 
                  : currentLang === 'en' 
                  ? 'Official checklist required for this specific immigration petition.' 
                  : 'Danh sách tài liệu chính thức cần nộp cho thủ tục này.'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Focused Summary Card for THIS Petition Only */}
        <div className="my-3 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-slate-200">
              총 <span className="text-cyan-300 font-mono text-sm font-extrabold">{docList.length}</span>건의 서류가 필요합니다.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 flex-wrap">
            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              시스템 자동생성 {countAuto}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              회사 발급 {countCompany}
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              본인 준비 {countPersonal}
            </span>
          </div>
        </div>

        {/* Document List for THIS Petition Only */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {docList.length > 0 ? (
            docList.map((doc, idx) => {
              let badgeStyle = '';
              let borderStyle = '';
              let labelTypeStr = '';

              if (doc.type === 'auto') {
                badgeStyle = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                borderStyle = 'border-blue-500/20 bg-blue-950/20';
                labelTypeStr = currentLang === 'kr' ? '시스템 자동생성' : currentLang === 'en' ? 'System Compiled' : 'Tạo tự động';
              } else if (doc.type === 'company') {
                badgeStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                borderStyle = 'border-emerald-500/20 bg-emerald-950/20';
                labelTypeStr = currentLang === 'kr' ? '회사 측 준비' : currentLang === 'en' ? 'Company Provided' : 'Công ty cấp';
              } else {
                badgeStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                borderStyle = 'border-amber-500/20 bg-amber-950/20';
                labelTypeStr = currentLang === 'kr' ? '본인 직접 준비' : currentLang === 'en' ? 'Foreigner Preps' : 'Cá nhân chuẩn bị';
              }

              const isTranslated = translatedField === doc.name.kr;
              const displayedText = isTranslated ? doc.name[currentLang] : doc.name.kr;

              return (
                <div
                  key={idx}
                  className={`flex items-start sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-200 gap-2.5 ${borderStyle}`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-500 shrink-0 mt-0.5 sm:mt-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        onClick={() => handleToggleTranslate(doc.name.kr)}
                        className={`text-xs sm:text-sm font-semibold text-slate-200 hover:text-white leading-snug cursor-pointer select-none block break-keep transition-colors ${
                          isTranslated ? 'text-cyan-300 font-extrabold' : ''
                        }`}
                        title={currentLang !== 'kr' ? '클릭하여 번역 보기' : undefined}
                      >
                        {displayedText}
                      </span>
                      {doc.type === 'auto' && (
                        <span className="text-[10px] text-blue-400/80 block mt-0.5">
                          ※ 본 시스템에서 입력된 정보로 자동 작성되어 다운로드됩니다.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <span className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-lg font-bold whitespace-nowrap ${badgeStyle}`}>
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
            })
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              해당 민원에 등록된 서류 목록이 없습니다.
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/10 shrink-0 space-y-2 mt-2">
          {companyDocs.length > 0 && onRequestCompanyDoc && (
            <button
              type="button"
              onClick={() => {
                onRequestCompanyDoc(companyDocs.map(d => d.name.kr));
              }}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="break-keep">
                회사 준비 서류 일괄 발급 요청문 작성 ({companyDocs.length}건)
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold hover:bg-white/10 transition text-xs cursor-pointer"
          >
            {currentLang === 'kr' ? '확인했습니다 (창 닫기)' : currentLang === 'en' ? 'Got it (Close)' : 'Đã hiểu (Đóng)'}
          </button>
        </div>

      </div>
    </div>
  );
};
