import React from 'react';
import { ShieldCheck, Lock, Trash2, X, CheckCircle2, FileText } from 'lucide-react';
import { LangCode } from '../i18n';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  onClearPrivacyCache: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onClearPrivacyCache
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#171a26]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {lang === 'kr' ? '개인정보 및 고유식별정보 처리 방침' : 'Personal Information & Compliance Policy'}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-400 font-mono truncate">
                개인정보보호법 제15조 / 제24조(고유식별정보의 처리 제한) 준수
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 flex-1 text-xs leading-relaxed text-slate-300">
          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              1. 수집 및 처리 목적
            </h4>
            <p className="text-slate-300 break-keep">
              본 시스템(HelpMe Visa)은 외국인 근로자의 <strong>출입국관리법 제31조(외국인등록), 제25조(체류기간 연장허가), 제21조(근무처 변경·추가)</strong> 등에 따른 법무부 공식 민원 서식(통합신청서, 신원보증서, 거주숙소확인서, 외국인 직업 및 연간소득신고서)의 작성 및 인쇄를 자동화하기 위한 목적으로만 최소한의 정보를 처리합니다.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              2. 처리하는 고유식별정보 및 개인정보 항목
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>고유식별정보:</strong> 외국인등록번호(ARC), 여권번호</li>
              <li><strong>일반 개인정보:</strong> 성명(영문/한글), 생년월일, 국적, 성별, 주소, 연락처, 이메일, 연소득, 직업</li>
              <li><strong>사업장 정보:</strong> 상호, 사업자등록번호, 사업장 주소, 대표자 성명, 대표자 마스킹 식별번호</li>
            </ul>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              3. 보유 및 이용 기간과 파기 원칙
            </h4>
            <p className="text-slate-300 break-keep">
              입력된 모든 개인정보는 <strong>서류 PDF 생성 및 인쇄 완료 즉시 사용자의 요청에 따라 파기</strong>할 수 있으며, 서버에 영구 보관되지 않고 세션 및 로컬 브라우저 암호화 캐시에만 일시 저장됩니다.
            </p>
          </div>

          {/* Action Box: Purge Cache */}
          <div className="p-3.5 sm:p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-red-300 text-xs sm:text-sm flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                기기 내 임시 개인정보 즉시 파기
              </h5>
              <p className="text-slate-400 text-[11px] mt-0.5 break-keep">
                현재 브라우저에 임시 저장된 외국인등록번호, 여권번호, 작성 서식을 완전히 삭제합니다.
              </p>
            </div>
            <button
              onClick={() => {
                onClearPrivacyCache();
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-lg text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              데이터 즉시 삭제
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-[#171a26] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-center"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
