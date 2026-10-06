import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Building2, Copy, Mail, MessageSquare, Printer, Check, 
  Calendar, User, FileText, CheckCircle2, Eye, Plus, Trash2,
  FileCheck, Sparkles, ExternalLink
} from 'lucide-react';
import { FormData } from '../types';
import { reqNames } from '../i18n';

interface CompanyDocRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  targetDocNames?: string[];
  visaType: string;
  reqType: string;
}

const DEFAULT_COMPANY_DOCS = [
  '사업자등록증 사본 (법인/개인)',
  '표준근로계약서 사본 (임금·근무시간 명시)',
  '납세증명서(국세완납증명) 및 지방세납세증명서',
  '부가가치세과세표준증명원 (최근 1년)',
  '고용보험 피보험자격 취득자 명부 (내국인 고용비율 확인용)',
  '회사 고용사유서 및 대표자 직인 날인본',
  '외국인 고용허가서 사본 (E-9)',
  '원천징수이행상황신고서'
];

export const CompanyDocRequestModal: React.FC<CompanyDocRequestModalProps> = ({
  isOpen,
  onClose,
  formData,
  targetDocNames = [],
  visaType,
  reqType
}) => {
  const [recipientType, setRecipientType] = useState<'ceo' | 'hr' | 'custom'>('hr');
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [formatMode, setFormatMode] = useState<'email' | 'messenger' | 'formal'>('email');
  const [copied, setCopied] = useState<boolean>(false);
  const [customDocInput, setCustomDocInput] = useState<string>('');
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});

  // Sync available docs & selected state whenever modal opens or targetDocNames change
  useEffect(() => {
    if (isOpen) {
      const mergedList = Array.from(new Set([
        ...(targetDocNames && targetDocNames.length > 0 ? targetDocNames : []),
        ...DEFAULT_COMPANY_DOCS
      ]));
      setAvailableDocs(mergedList);

      const initialMap: Record<string, boolean> = {};
      if (targetDocNames && targetDocNames.length > 0) {
        targetDocNames.forEach(d => { initialMap[d] = true; });
      } else {
        // Default top 4 items checked
        mergedList.slice(0, 4).forEach(d => { initialMap[d] = true; });
      }
      setSelectedDocs(initialMap);
    }
  }, [isOpen, targetDocNames]);

  // Calculate default deadline (today + 3 days)
  const defaultDeadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}년 ${m}월 ${day}일`;
  }, []);

  const [deadline, setDeadline] = useState<string>(defaultDeadline);
  const [additionalNote, setAdditionalNote] = useState<string>('');

  if (!isOpen) return null;

  const fullName = `${formData.i_surname} ${formData.i_givenname}`.trim().toUpperCase() || '외국인 근로자';
  const companyName = formData.i_cname || '에이치디현대삼호 협력사';
  const repName = formData.i_rep_name || '대표이사';
  const reqTitle = reqNames[reqType] || '체류기간 연장허가';
  const arcMasked = formData.i_arc 
    ? (formData.i_arc.length > 7 ? `${formData.i_arc.slice(0, 8)}******` : formData.i_arc)
    : '외국인등록번호 확인필요';
  const nationality = formData.i_nation || '외국인';

  const recipientLabel = recipientType === 'ceo' 
    ? `${companyName} ${repName} 대표이사님 귀하`
    : recipientType === 'hr'
    ? `${companyName} 총무·인사 담당자님 귀하`
    : (customRecipient.trim() || `${companyName} 서류 담당자님 귀하`);

  const activeDocList = availableDocs.filter(k => selectedDocs[k]);

  const handleAddCustomDoc = () => {
    const trimmed = customDocInput.trim();
    if (!trimmed) return;
    if (!availableDocs.includes(trimmed)) {
      setAvailableDocs(prev => [...prev, trimmed]);
    }
    setSelectedDocs(prev => ({ ...prev, [trimmed]: true }));
    setCustomDocInput('');
  };

  // Generate clean, polite Email text
  const emailSubject = `[서류 발급 요청] ${fullName} 근로자 출입국 비자(${visaType || 'E-7/E-9'}) 관련 서류`;
  
  const emailBody = `${recipientLabel}

안녕하십니까, 외국인 근로자 출입국 체류관리 행정 지원과 관련하여 회사 구비 서류 발급을 정중히 요청드립니다.

1. 대상 근로자 인적사항
• 성명: ${fullName} (${nationality})
• 외국인등록번호: ${arcMasked}
• 신청 민원: ${visaType || '비자'} / ${reqTitle}
• 소속 사업장: ${companyName}

2. 발급 요청 서류 목록 (${activeDocList.length}건)
${activeDocList.length > 0 ? activeDocList.map((doc, idx) => `${idx + 1}. ${doc}`).join('\n') : '(선택된 서류가 없습니다.)'}

3. 제출 요청 기한: ${deadline}까지
${additionalNote ? `• 추가 메모/전달사항: ${additionalNote}\n` : ''}
출입국관서 법정 접수 기한 준수를 위해 빠른 서류 발급 협조를 부탁드립니다. 감사합니다.

${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
신청인 / 담당자 드림`;

  // Generate concise Messenger / SMS text
  const messengerBody = `[비자 서류 발급 요청]
${recipientLabel}

${fullName} 근로자(${visaType || '비자'} ${reqTitle}) 출입국 접수용 회사 서류 발급을 요청드립니다.

■ 요청 서류 (${activeDocList.length}건):
${activeDocList.length > 0 ? activeDocList.map((doc, idx) => `· ${doc}`).join('\n') : '· 서류 목록 확인 필요'}

■ 제출 기한: ${deadline}까지
${additionalNote ? `■ 전달사항: ${additionalNote}\n` : ''}
기한 내 접수를 위해 빠른 발급 협조 부탁드립니다. 감사합니다.`;

  const currentDisplayContent = formatMode === 'messenger' ? messengerBody : emailBody;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentDisplayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = currentDisplayContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Trigger default Email Client (mailto:)
  const handleOpenMailApp = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  // Trigger default SMS Client (sms:)
  const handleOpenSmsApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${separator}body=${encodeURIComponent(messengerBody)}`;
    window.location.href = smsUrl;
  };

  // Trigger Print memo
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>사내 협조요청서 - ${fullName}</title>
        <style>
          body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #003366; letter-spacing: -0.5px; }
          .meta { font-size: 13px; color: #555; margin-top: 8px; display: flex; justify-content: space-between; }
          .section-title { font-size: 15px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; color: #003366; border-left: 4px solid #003366; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f4f6f9; width: 25%; font-weight: bold; }
          .doc-table th { background: #eef2f7; text-align: center; }
          .doc-table td { text-align: left; }
          .footer { margin-top: 50px; text-align: right; font-size: 15px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">사 내 협 조 요 청 서</div>
          <div class="meta">
            <span>문서번호: HDSH-VISA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}</span>
            <span>수신: ${recipientLabel}</span>
          </div>
        </div>

        <div class="section-title">1. 대상 외국인 근로자 인적사항</div>
        <table>
          <tr>
            <th>성명 (Full Name)</th>
            <td><strong>${fullName}</strong> (${nationality})</td>
            <th>외국인등록번호</th>
            <td>${arcMasked}</td>
          </tr>
          <tr>
            <th>체류자격 / 민원</th>
            <td>${visaType || '비자'} / ${reqTitle}</td>
            <th>소속 사업장</th>
            <td>${companyName}</td>
          </tr>
        </table>

        <div class="section-title">2. 발급 요청 서류 목록 (${activeDocList.length}건)</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 10%;">연번</th>
              <th>요청 서류 명칭</th>
              <th style="width: 25%;">용도 및 비고</th>
            </tr>
          </thead>
          <tbody>
            ${activeDocList.map((d, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${d}</strong></td>
                <td>출입국관서 제출용</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">3. 요청 기한 및 전달사항</div>
        <table>
          <tr>
            <th>제출 기한</th>
            <td><strong style="color: #c00;">${deadline}까지</strong></td>
          </tr>
          ${additionalNote ? `
          <tr>
            <th>전달사항</th>
            <td>${additionalNote}</td>
          </tr>
          ` : ''}
        </table>

        <p style="margin-top: 25px; font-size: 14px; line-height: 1.8;">
          위 근로자의 출입국 체류관리 법정 기한 내 접수를 위해 상기 서류의 신속한 발급 및 직인 날인을 정중히 요청드립니다.
        </p>

        <div class="footer">
          <p>${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin-top: 15px; font-weight: bold; font-size: 16px;">
            ${companyName} 총무·인사팀 / 신청 담당자 (인)
          </p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[180] flex items-center justify-center p-2 sm:p-4 select-none animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#10121a] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#151824] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white truncate">
                  회사 서류 발급 요청문 자동 생성
                </h3>
                <span className="hidden xs:inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shrink-0">
                  메일 · 문자 · 공문
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                대표이사 또는 총무팀에 전달할 요청문을 작성하고 실시간 미리보기를 제공합니다.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Config Row: Recipient & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recipient */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>수신 대상 선택</span>
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRecipientType('hr')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'hr'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  총무·인사팀
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('ceo')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'ceo'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  대표이사
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('custom')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'custom'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  직접 입력
                </button>
              </div>
              {recipientType === 'custom' && (
                <input 
                  type="text"
                  placeholder="예: 김총무 부장님 귀하"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>제출 요청 기한</span>
              </label>
              <input 
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="예: 2026년 09월 29일까지"
                className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                출입국 방문 및 접수 일정에 맞추어 조정하세요.
              </p>
            </div>
          </div>

          {/* Target Documents Checklist with Add Custom Doc */}
          <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>요청 서류 목록 선택</span>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {activeDocList.length}건 선택됨
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const allMap: Record<string, boolean> = {};
                  const isAllChecked = availableDocs.every(d => selectedDocs[d]);
                  availableDocs.forEach(d => { allMap[d] = !isAllChecked; });
                  setSelectedDocs(allMap);
                }}
                className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
              >
                {availableDocs.every(d => selectedDocs[d]) ? '선택 해제' : '전체 선택'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {availableDocs.map(doc => {
                const isChecked = !!selectedDocs[doc];
                return (
                  <label 
                    key={doc}
                    className={`flex items-center p-2 rounded-xl border text-xs transition cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-200 font-medium shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setSelectedDocs(prev => ({
                          ...prev,
                          [doc]: e.target.checked
                        }));
                      }}
                      className="w-3.5 h-3.5 text-blue-500 rounded border-white/20 mr-2 bg-black/40 cursor-pointer shrink-0"
                    />
                    <span className="truncate">{doc}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom document add input */}
            <div className="flex gap-1.5 pt-1">
              <input 
                type="text"
                placeholder="+ 기타 필요한 사내 서류 직접 입력 (예: 재직증명서, 신분증 사본)"
                value={customDocInput}
                onChange={(e) => setCustomDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDoc();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomDoc}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
              >
                추가
              </button>
            </div>
          </div>

          {/* Mode Tabs & Live Preview Header */}
          <div className="space-y-2">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">실시간</span> 미리보기
                </span>
                <button
                  type="button"
                  onClick={() => setFormatMode('email')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'email'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>이메일</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('messenger')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'messenger'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>문자/알림톡</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('formal')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'formal'
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3 h-3" />
                  <span>공문 서식</span>
                </button>
              </div>
              
              <button
                onClick={handleCopy}
                className={`self-end xs:self-auto px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : '본문 복사'}</span>
              </button>
            </div>

            {/* Message Preview Box */}
            {formatMode === 'formal' ? (
              /* Formal Document Layout Preview */
              <div className="p-4 bg-white text-slate-900 rounded-xl font-sans text-xs border border-white/20 shadow-md max-h-60 overflow-y-auto select-text leading-normal">
                <div className="text-center font-bold text-sm tracking-widest border-b-2 border-slate-900 pb-2 mb-3">
                  사 내 협 조 요 청 서 (출입국 비자 서류)
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-3">
                  <span>문서번호: HDSH-IMMI-{new Date().getFullYear()}-0926</span>
                  <span>수신: <strong>{recipientLabel}</strong></span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-3">
                  <div className="font-bold text-slate-800 mb-1">■ 대상 근로자: {fullName} ({nationality})</div>
                  <div className="text-slate-600">등록번호: {arcMasked} | 체류자격: {visaType || '비자'} ({reqTitle})</div>
                </div>
                <div className="font-bold text-slate-800 mb-1.5">■ 요청 서류 목록 ({activeDocList.length}건):</div>
                <ol className="list-decimal pl-5 space-y-0.5 text-slate-700 mb-3">
                  {activeDocList.map((doc, i) => (
                    <li key={i} className="font-medium">{doc}</li>
                  ))}
                </ol>
                <div className="text-slate-800 mb-2">
                  ■ 제출 기한: <strong className="text-rose-600">{deadline}까지</strong>
                </div>
                {additionalNote && (
                  <div className="text-slate-600 mb-2">■ 추가 요청사항: {additionalNote}</div>
                )}
                <div className="text-right text-slate-500 text-[11px] mt-4 pt-2 border-t border-slate-200">
                  {companyName} 사내 비자행정 담당자
                </div>
              </div>
            ) : (
              /* Text Format (Email / Messenger) */
              <div className="relative">
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-text shadow-inner">
                  {currentDisplayContent}
                </div>
              </div>
            )}
          </div>

          {/* Additional Note input */}
          <div className="space-y-1">
            <input 
              type="text"
              placeholder="추가 전달사항이나 메모가 있는 경우 입력 (선택)"
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer with One-Click Send Actions */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#151824] border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>원클릭 전송 및 인쇄 지원</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>공문 인쇄/PDF</span>
            </button>

            <button
              onClick={handleOpenSmsApp}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>문자 앱 전송</span>
            </button>

            <button
              onClick={handleOpenMailApp}
              className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>이메일 전송</span>
            </button>

            <button
              onClick={() => {
                handleCopy();
                setTimeout(() => onClose(), 600);
              }}
              className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>복사 후 닫기</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
