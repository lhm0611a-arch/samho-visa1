import React from 'react';
import { 
  Home, Users, Plus, Camera, Upload, Trash2, 
  AlertTriangle, Check, CheckCircle2, RotateCw, Info, HelpCircle,
  FileText, Download, ArrowRight, ArrowLeft, Loader2, Search, X, 
  Globe, FileSpreadsheet, Sparkles, CheckSquare, Edit3, Milestone,
  FileSignature, Calendar, Building2, ShieldCheck, FileUp, Eye,
  Crosshair, Briefcase, ChevronRight, ChevronLeft, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { FormData, EmployeeDBItem, VerificationIssue, VerificationResponse, VisaType, ReqType, SubmitterType, OwnershipType, HousingType, WorkplaceProfile } from './types';
import { i18nDict, LangCode, reqNames, docMatrix } from './i18n';
import { DocInfoModal } from './components/DocInfoModal';
import { DBModal } from './components/DBModal';
import { DatePicker } from './components/DatePicker';
import { CameraModal } from './components/CameraModal';
import { WorkplaceModal } from './components/WorkplaceModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { PdfDebugModal } from './components/PdfDebugModal';
import { CountryFlagPicker } from './components/CountryFlagPicker';
import { LanguageFlagPicker } from './components/LanguageFlagPicker';
import { CompanyDocRequestModal } from './components/CompanyDocRequestModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { saveEmployee } from './firebase';
import { initialFormData, PDF_COORDS_MAIN, PDF_COORDS_RESIDENCE, PDF_COORDS_GUARANTEE, PDF_COORDS_INCOME, DEFAULT_WORKPLACES, SHIPYARD_JOB_CODES, CustomDocItem, BUILTIN_PRESET_DOCS, resolveFieldValueForCoord } from './constants/formConstants';
import { 
  renderE74RRecommend, 
  renderE74RScoreSheet, 
  renderE74RPersonalStmt, 
  renderE74RCompanyRecommend, 
  renderLaborContract, 
  renderEmploymentCert 
} from './utils/pdfDocRenderers';

export default function App() {
  const [step, setStep] = React.useState<number | 'excel'>(0);
  const [isBatchMode, setIsBatchMode] = React.useState<boolean>(false);
  const [currentLang, setCurrentLang] = React.useState<LangCode>('kr');
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [isOCRProcessing, setIsOCRProcessing] = React.useState(false);
  const [isVerifyProcessing, setIsVerifyProcessing] = React.useState(false);
  const [isExcelProcessing, setIsExcelProcessing] = React.useState(false);
  
  // Modals state
  const [isDocInfoOpen, setIsDocInfoOpen] = React.useState(false);
  const [activeDocInfoType, setActiveDocInfoType] = React.useState<string>('chk_extension');
  const [isDBModalOpen, setIsDBModalOpen] = React.useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = React.useState(false);
  const [isWorkplaceModalOpen, setIsWorkplaceModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = React.useState(false);
  const [debugModalDocType, setDebugModalDocType] = React.useState<string>('income');
  
  // PDF Preview Modal State
  const [previewPdfState, setPreviewPdfState] = React.useState<{
    isOpen: boolean;
    url: string | null;
    title: string;
    filename?: string;
  }>({
    isOpen: false,
    url: null,
    title: '',
    filename: ''
  });

  const handleOpenPdfPreview = (url: string, title: string, filename?: string) => {
    setPreviewPdfState({
      isOpen: true,
      url,
      title,
      filename
    });
  };

  // Company Document Request Modal State
  const [isCompanyDocModalOpen, setIsCompanyDocModalOpen] = React.useState(false);
  const [companyDocModalTargets, setCompanyDocModalTargets] = React.useState<string[]>([]);

  const handleOpenCompanyDocRequest = (docs?: string[]) => {
    if (docs && docs.length > 0) {
      setCompanyDocModalTargets(docs);
    } else {
      const currentDocList = docMatrix[formData.visaType]?.[formData.reqType] || docMatrix[formData.visaType]?.['default'] || [];
      const compDocs = currentDocList.filter(d => d.type === 'company').map(d => d.name.kr);
      setCompanyDocModalTargets(compDocs.length > 0 ? compDocs : [
        '사업자등록증 사본 (법인/개인)',
        '표준근로계약서 사본 (임금·근무시간 명시)',
        '납세증명서(국세완납증명) 및 지방세납세증명서',
        '부가가치세과세표준증명원 (최근 1년)',
        '고용보험 피보험자격 취득자 명부 (내국인 고용비율 확인용)',
        '외국인 고용허가서 사본 (E-9)',
        '회사 고용사유서 및 대표자 직인 날인본'
      ]);
    }
    setIsCompanyDocModalOpen(true);
  };
  
  // Custom Registered Documents State
  const [customDocList, setCustomDocList] = React.useState<CustomDocItem[]>(() => {
    try {
      const saved = localStorage.getItem('customDocRegistry');
      if (saved) {
        const parsed: CustomDocItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const missing = BUILTIN_PRESET_DOCS.filter(b => !parsed.some(p => p.id === b.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('customDocRegistry', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [...BUILTIN_PRESET_DOCS];
  });
  
  // Workplaces state
  const [workplaces, setWorkplaces] = React.useState<WorkplaceProfile[]>(() => {
    try {
      const saved = localStorage.getItem('visaWorkplaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const missing = DEFAULT_WORKPLACES.filter(d => !parsed.some(p => p.id === d.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('visaWorkplaces', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch(e) {}
    return DEFAULT_WORKPLACES;
  });
  const [selectedWorkplaceId, setSelectedWorkplaceId] = React.useState<string>('gayoung_tech');

  // Privacy & Masking toggles
  const [maskArc, setMaskArc] = React.useState<boolean>(true);
  const [maskPassport, setMaskPassport] = React.useState<boolean>(false);
  const [privacyAgreed, setPrivacyAgreed] = React.useState<boolean>(() => {
    return localStorage.getItem('privacyAgreed') === 'true';
  });

  const [msgDialog, setMsgDialog] = React.useState<{ isOpen: boolean; title: string; desc: string; type: 'info' | 'error' | 'success' }>({
    isOpen: false,
    title: '',
    desc: '',
    type: 'info'
  });
  const [confirmDialog, setConfirmDialog] = React.useState<{ isOpen: boolean; title: string; desc: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: () => {}
  });

  // AI Verification issues and error highlights
  const [issues, setIssues] = React.useState<VerificationIssue[]>([]);
  const [verificationPassed, setVerificationPassed] = React.useState<boolean | null>(null);
  const [errorHighlights, setErrorHighlights] = React.useState<Set<string>>(new Set());
  const [activePickerSection, setActivePickerSection] = React.useState<'personal' | 'dorm' | 'guar' | null>(null);

  // Attachments for Step 5 AI cross-checking
  const [attachments, setAttachments] = React.useState<{ id: string; name: string; base64: string; mimeType: string }[]>([]);

  // Selected PDFs to download in Step 6 (4 Legal Documents + Custom Docs)
  const [selectedDocs, setSelectedDocs] = React.useState<Record<string, boolean>>({
    main: true,
    residence: true,
    guarantee: false,
    income: true
  });
  const [downloadLinks, setDownloadLinks] = React.useState<{ name: string; url: string; filename: string }[]>([]);
  const [checkedRequiredDocs, setCheckedRequiredDocs] = React.useState<Record<string, boolean>>({});

  // Load auto-save values on boot
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('visaAutoSave');
      if (saved) {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync chosen papers based on step changes
  React.useEffect(() => {
    if (step === 6) {
      const isResNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg', 'chk_change_status'].includes(formData.reqType);
      const isGuarNeeded = ['E-7-4R', 'E-7-3', 'E-7-4', 'E-7'].includes(formData.visaType) && ['chk_extension', 'chk_change_status'].includes(formData.reqType);
      const isIncomeNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg', 'chk_change_status'].includes(formData.reqType);
      const isE74R = formData.visaType === 'E-7-4R';
      const isShipyardE7 = ['E-7-4R', 'E-7-3', 'E-7-4'].includes(formData.visaType);

      setSelectedDocs(prev => ({
        main: true,
        residence: isResNeeded,
        guarantee: isGuarNeeded,
        income: isIncomeNeeded,
        e74r_recommend: isE74R,
        e74r_score_sheet: isE74R,
        e74r_personal_stmt: isE74R,
        e74r_company_recommend: isE74R,
        contract_std: true,
        employment_cert: isShipyardE7,
        ...prev
      }));
    }
  }, [step, formData.reqType, formData.visaType]);

  const handleSaveWorkplaces = (wps: WorkplaceProfile[]) => {
    setWorkplaces(wps);
    try {
      localStorage.setItem('visaWorkplaces', JSON.stringify(wps));
    } catch(e) {}
  };

  const handleSelectWorkplace = (wp: WorkplaceProfile) => {
    setSelectedWorkplaceId(wp.id);
    handleFormChange('i_cname', wp.name);
    handleFormChange('i_cregno', wp.regNo);
    handleFormChange('i_rep_name', wp.repName);
    handleFormChange('i_rep_id', wp.repIdMasked || '650101-1******');
    handleFormChange('i_rep_gender', wp.repGender);
    handleFormChange('i_caddr', wp.address);
    handleFormChange('i_cphone', wp.phone);
  };

  const handleClearPrivacyCache = () => {
    localStorage.removeItem('visaAutoSave');
    setFormData({ ...initialFormData });
    showAlert('개인정보 파기 완료', '브라우저에 보관된 개인정보 및 양식 캐시가 완전히 삭제되었습니다.', 'success');
  };

  // Translate helper
  const t = (key: string): string => {
    return i18nDict[currentLang]?.[key] || key;
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    // String processing based on custom type inputs
    let processedValue = value;
    
    // Auto captilize surnames, givennames, nationality, passport
    if (['i_surname', 'i_givenname', 'i_nation', 'i_passport', 'i_address_home', 'i_email', 'val_change_status'].includes(key)) {
      processedValue = typeof value === 'string' ? value.toUpperCase() : value;
    }

    const updated = { ...formData, [key]: processedValue };
    setFormData(updated);

    // Save state
    try {
      localStorage.setItem('visaAutoSave', JSON.stringify(updated));
    } catch(e) {}

    // Revoke highlight on input change
    if (errorHighlights.has(key)) {
      const updatedSet = new Set(errorHighlights);
      updatedSet.delete(key);
      setErrorHighlights(updatedSet);
    }
  };

  // Safe confirm prompt
  const showConfirm = (title: string, desc: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, desc, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleHomeClick = () => {
    showConfirm(
      '홈 화면 이동 (Go Home)',
      '현재 작성 중인 내용은 기기에 임시저장됩니다. 첫 화면으로 돌아가시겠습니까?',
      () => {
        setStep(0);
      }
    );
  };

  const handleConfirmOk = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  // Safe message alerts
  const showAlert = (title: string, desc: string, type: 'info' | 'error' | 'success' = 'info') => {
    setMsgDialog({ isOpen: true, title, desc, type });
  };

  const closeAlert = () => {
    setMsgDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Dynamic conditional views
  const isNewWorkplaceNeeded = ['chk_change_work', 'chk_change_status'].includes(formData.reqType);
  const isDormNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg'].includes(formData.reqType);
  const isFamilyProxyNeeded = formData.submitter !== 'self';
  const isReentryPeriodNeeded = formData.reqType === 'chk_reentry';
  const isRefundAccountNeeded = ['chk_alien_reg', 'chk_reissue'].includes(formData.reqType);
  const isGuaranteeNeeded = formData.visaType === 'E-7' && ['chk_extension', 'chk_change_status'].includes(formData.reqType);

  // Auto formatters
  const formatPhoneNumber = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.startsWith('02')) {
      if (raw.length <= 2) return raw;
      if (raw.length <= 5) return `${raw.slice(0, 2)}-${raw.slice(2)}`;
      if (raw.length <= 9) return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5)}`;
      return `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6, 10)}`;
    } else {
      if (raw.length <= 3) return raw;
      if (raw.length <= 6) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
      if (raw.length <= 10) return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
      return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
  };

  const formatRegNo = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 6) return raw;
    return `${raw.slice(0, 6)}-${raw.slice(6, 13)}`;
  };

  const formatBusinessNo = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
  };

  const formatMoney = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return Number(raw).toLocaleString('en-US');
  };

  const formatDate = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 4) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  };

  // Client Employee Database functions
  const handleSaveToDB = async () => {
    if (!formData.i_arc || !formData.i_surname) return;
    try {
      const updatedItem: EmployeeDBItem = {
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      await saveEmployee(updatedItem);
    } catch(err) {
      console.error('Failed to save to database:', err);
    }
  };

  const handleLoadItem = (item: EmployeeDBItem) => {
    setFormData(item);
    setIsDBModalOpen(false);
    setErrorHighlights(new Set());
    showAlert('불러오기 완료 (Success)', `${item.i_surname} 직원의 데이터를 명부에서 가져왔습니다.`, 'success');
  };

  const handleDeleteItem = (arc: string) => {
    try {
      const dbStr = localStorage.getItem('visa_employee_db') || '[]';
      let db: EmployeeDBItem[] = JSON.parse(dbStr);
      db = db.filter(e => e.i_arc !== arc);
      localStorage.setItem('visa_employee_db', JSON.stringify(db));
    } catch(err) {
      console.error(err);
    }
  };

  // OCR Processing
  const processOCRFile = async (file: File) => {
    setIsOCRProcessing(true);
    setErrorHighlights(new Set());

    try {
      // Read base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type })
      });

      if (!response.ok) {
        throw new Error('AI OCR 판독에 실패했습니다. 형식이나 통신 상태를 체크하십시오.');
      }

      const rawResult = await response.json();
      
      // Update form dynamically from whatever document was uploaded (ARC, Passport, Business Reg, Contract, etc.)
      setFormData(prev => ({
        ...prev,
        i_surname: rawResult.i_surname || prev.i_surname,
        i_givenname: rawResult.i_givenname || prev.i_givenname,
        i_dob: rawResult.i_dob || prev.i_dob,
        i_gender: (rawResult.i_gender === 'M' || rawResult.i_gender === 'F') ? rawResult.i_gender : prev.i_gender,
        i_nation: rawResult.i_nation || prev.i_nation,
        i_arc: rawResult.i_arc ? formatRegNo(rawResult.i_arc) : prev.i_arc,
        i_passport: rawResult.i_passport || prev.i_passport,
        i_pass_issue: rawResult.i_pass_issue || prev.i_pass_issue,
        i_pass_exp: rawResult.i_pass_exp || prev.i_pass_exp,
        i_address_kr: rawResult.i_address_kr || prev.i_address_kr,
        i_cellphone: rawResult.i_cellphone ? formatPhoneNumber(rawResult.i_cellphone) : prev.i_cellphone,
        i_cname: rawResult.i_cname || prev.i_cname,
        i_cregno: rawResult.i_cregno ? formatBusinessNo(rawResult.i_cregno) : prev.i_cregno,
        i_rep_name: rawResult.i_rep_name || prev.i_rep_name,
        i_rep_id: rawResult.i_rep_id ? formatRegNo(rawResult.i_rep_id) : prev.i_rep_id,
        i_caddr: rawResult.i_caddr || prev.i_caddr,
        i_cphone: rawResult.i_cphone ? formatPhoneNumber(rawResult.i_cphone) : prev.i_cphone,
        i_job: rawResult.i_job || prev.i_job,
        i_job_code: rawResult.i_job_code || prev.i_job_code,
        i_income: rawResult.i_income || prev.i_income,
        i_dorm_start: rawResult.i_dorm_start || prev.i_dorm_start,
        visaType: (['E-7-4R', 'E-7-3', 'E-7-4', 'E-9', 'E-7', 'F-2-R'].includes(rawResult.visaType) ? rawResult.visaType : prev.visaType)
      }));

      showAlert(
        'AI 정밀 판독 완료 (OCR Success)', 
        '신분증/공문서에서 인적사항, 체류지 주소, 사업장 정보 및 소득·직무 내용을 자동으로 인식하여 입력했습니다.\n각 단계별 입력 내용을 확인해 주세요.', 
        'success'
      );
    } catch(err: any) {
      showAlert('OCR 실패 (OCR Error)', err.message || '판독 서버 응답 오류가 발생했습니다. 수동 마킹을 하십시오.', 'error');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleOCRFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processOCRFile(file);
    e.target.value = ''; // clears
  };

  // Verify Documents with Gemini AI
  const handleVerify = async () => {
    if (attachments.length === 0) {
      showAlert('안내 (Notice)', '교차 대조를 시작하기 위해 측면에 검증용 증증명 파일(여권, 비자사본, 근로계약 등)을 촬영/업로드해 두십시오.', 'info');
      return;
    }

    setIsVerifyProcessing(true);
    setIssues([]);
    setVerificationPassed(null);
    setErrorHighlights(new Set());

    try {
      const response = await fetch('/api/gemini/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: attachments,
          formData: formData,
          language: currentLang === 'kr' ? 'Korean' : currentLang === 'vn' ? 'Vietnamese' : currentLang === 'ne' ? 'Nepali' : 'English'
        })
      });

      if (!response.ok) {
        throw new Error('교차 검증 실패');
      }

      const data: VerificationResponse = await response.json();
      
      setIssues(data.issues);
      if (data.status === 'PASS' || data.issues.length === 0) {
        setVerificationPassed(true);
        showAlert('AI 검증 완료 (100% Match!)', '제출된 증빙과 서류 정보가 정확히 대조되었습니다. 다음 인쇄 단계로 가셔도 안전합니다.', 'success');
      } else {
        setVerificationPassed(false);
        const highlights = new Set<string>();
        data.issues.forEach(i => {
          if (i.fieldId) highlights.add(i.fieldId);
        });
        setErrorHighlights(highlights);
        showAlert(
          t('ai_msg_fail_title'),
          `${t('ai_msg_fail_desc')} (검출 오류: ${data.issues.length}건)`,
          'info'
        );
      }
    } catch (err: any) {
      showAlert(t('ai_msg_err_title'), t('ai_msg_err_desc'), 'error');
    } finally {
      setIsVerifyProcessing(false);
    }
  };

  // Handle step navigations
  const handleNextStep = (next: number | 'excel') => {
    if (typeof next === 'number' && next > 1 && next < 6) {
      handleSaveToDB();
    }
    setStep(next);
    window.scrollTo(0,0);
  };

  const handlePrevStep = (prev: number | 'excel') => {
    setStep(prev);
    window.scrollTo(0,0);
  };

  // Reset function
  const handleResetData = () => {
    showConfirm(
      '데이터 완전 초기화 (Reset App)', 
      '현재 기기에 입력된 모든 외국인 비자 지원 임시 등록정보를 제거하고 처음부터 새로 기재하시겠습니까?', 
      () => {
        setFormData(initialFormData);
        try {
          localStorage.removeItem('visaAutoSave');
        } catch(e) {}
        setErrorHighlights(new Set());
        setAttachments([]);
        setIssues([]);
        setVerificationPassed(null);
        setDownloadLinks([]);
        setStep(0);
        showAlert('초기화 성공 (Cleaned)', '임시 작성 데이터가 기기에서 초기화되었습니다.', 'success');
      }
    );
  };

  // Helper to check if bytes start with '%PDF-'
  const isPdfBytes = (buf: ArrayBuffer | null): boolean => {
    if (!buf || buf.byteLength < 5) return false;
    const u8 = new Uint8Array(buf);
    return u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46 && u8[4] === 0x2D; // %PDF-
  };

  // Create document core helper
  const drawSingleDocBlob = async (docType: string, fontBuffer: ArrayBuffer, customFormData: FormData): Promise<Blob> => {
    let arrayBuffer: ArrayBuffer | null = null;
    const tplB64 = localStorage.getItem(`visaPdfTemplate_${docType}`);
    
    if (tplB64) {
      try {
        const decoded = Uint8Array.from(atob(tplB64), c => c.charCodeAt(0)).buffer;
        if (isPdfBytes(decoded)) {
          arrayBuffer = decoded;
        }
      } catch (err) {
        console.error("Local storage template error", err);
      }
    } else if (['main', 'residence', 'guarantee'].includes(docType)) {
      try {
        const res = await fetch(`/templates/${docType}.pdf`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && !contentType.includes('text/html')) {
          const buf = await res.arrayBuffer();
          if (isPdfBytes(buf)) {
            arrayBuffer = buf;
          }
        }
      } catch {
        // Silently proceed to vector build if static template is not present
      }
    }
    
    // Draw on existing government form template
    if (arrayBuffer && isPdfBytes(arrayBuffer)) {
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfDoc.registerFontkit(fontkit);
 
      const font = await pdfDoc.embedFont(fontBuffer);
      const page = pdfDoc.getPages()[0];
      const inkColor = rgb(0.1, 0.2, 0.85); // Blue high contrast pen ink
 
      let coords = docType === 'main' 
        ? PDF_COORDS_MAIN 
        : (docType === 'residence' 
          ? PDF_COORDS_RESIDENCE 
          : (docType === 'guarantee' 
            ? PDF_COORDS_GUARANTEE 
            : (docType === 'income' ? PDF_COORDS_INCOME : {})));

      let customTextMap: Record<string, string> = {};
      try {
        const savedText = localStorage.getItem('customPdfTextMap');
        if (savedText) customTextMap = JSON.parse(savedText);
      } catch (e) {}

      try {
        const savedCustom = localStorage.getItem('customPdfCoords');
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          if (parsed && parsed[docType]) {
            coords = parsed[docType];
          }
        }
      } catch (e) {
        console.error("Failed to load custom coordinates from localStorage:", e);
      }

      const drawBox = (coordKey: string, text: string) => {
        if (!text) return;
        const pos = (coords as any)[coordKey];
        if (!pos) return;

        if (pos.type === 'check') {
          page.drawText('V', { x: pos.x - 5, y: pos.y - 5, size: 12, font: font, color: inkColor });
          return;
        }

        if (pos.type === 'text' && pos.w && pos.h) {
          const str = String(text).trim();
          let fontSize = 9;
          let lines: string[] = [];
          let lineHeight = 0;

          if (str.includes('\n')) {
            lines = str.split('\n');
            lineHeight = fontSize * 1.2;
            while (fontSize >= 6) {
              let tooWide = false;
              for (const l of lines) {
                if (font.widthOfTextAtSize(l, fontSize) > pos.w) {
                  tooWide = true;
                }
              }
              if (!tooWide && (lines.length * lineHeight <= pos.h)) {
                break;
              }
              fontSize -= 0.5;
              lineHeight = fontSize * 1.2;
            }
          } else {
            while (fontSize >= 6) {
              lines = [];
              let tempLine = '';
              lineHeight = fontSize * 1.2;

              for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const testLine = tempLine + char;

                if (font.widthOfTextAtSize(testLine, fontSize) > pos.w - 2) {
                  let breakFound = false;
                  for (let j = tempLine.length - 1; j > 0; j--) {
                    if (tempLine[j] === '-' || tempLine[j] === ' ') {
                      lines.push(tempLine.substring(0, j));
                      tempLine = (tempLine[j] === '-' ? '-' : '') + tempLine.substring(j + 1) + char;
                      breakFound = true;
                      break;
                    }
                  }
                  if (!breakFound) {
                    if (tempLine !== '') {
                      lines.push(tempLine);
                      tempLine = char;
                    } else {
                      lines.push(testLine);
                      tempLine = '';
                    }
                  }
                } else {
                  tempLine = testLine;
                }
              }
              if (tempLine) lines.push(tempLine);
              if (lines.length * lineHeight <= pos.h + 2) break;

              fontSize -= 0.5;
            }
          }

          const startY = pos.y + (pos.h / 2) + ((lines.length * lineHeight) / 2) - fontSize + (fontSize * 0.2);

          lines.forEach((line, idx) => {
            const textW = font.widthOfTextAtSize(line.trim(), fontSize);
            let drawX = pos.x + (pos.w / 2) - (textW / 2);
            if (drawX < pos.x) drawX = pos.x;

            page.drawText(line.trim(), {
              x: drawX,
              y: startY - (idx * lineHeight),
              size: fontSize,
              font: font,
              color: inkColor
            });
          });
        }
      };

      const getUpperVal = (valStr: string) => (valStr || '').toUpperCase();
      const fullFName = getUpperVal(customFormData.i_surname) + ' ' + getUpperVal(customFormData.i_givenname);
      const today = new Date();
      const ty = String(today.getFullYear());
      const tm = String(today.getMonth() + 1);
      const td = String(today.getDate());

      if (docType === 'main') {
        const reqType = customFormData.reqType;
        if (reqType) drawBox(reqType, 'check');

        drawBox('val_change_status', getUpperVal(customFormData.val_change_status));
        drawBox('surname', getUpperVal(customFormData.i_surname));
        drawBox('givenname', getUpperVal(customFormData.i_givenname));

        const dob = customFormData.i_dob;
        if (dob) {
          const p = dob.split('-');
          if (p.length === 3) {
            drawBox('dob_yyyy', p[0]);
            drawBox('dob_mm', p[1]);
            drawBox('dob_dd', p[2]);
          }
        }

        const gender = customFormData.i_gender;
        if (gender === 'M') drawBox('gender_m', 'check');
        if (gender === 'F') drawBox('gender_f', 'check');

        drawBox('nation', getUpperVal(customFormData.i_nation));

        const arcRaw = (customFormData.i_arc || '').replace(/-/g, '');
        for (let i = 0; i < arcRaw.length; i++) {
          if (i < 13) drawBox(`arc_${i + 1}`, arcRaw[i]);
        }

        drawBox('passport', getUpperVal(customFormData.i_passport));
        drawBox('pass_issue', customFormData.i_pass_issue);
        drawBox('pass_exp', customFormData.i_pass_exp);
        drawBox('address_kr', customFormData.i_address_kr);
        drawBox('phone', customFormData.i_phone);
        drawBox('cellphone', customFormData.i_cellphone);
        drawBox('address_home', getUpperVal(customFormData.i_address_home));
        drawBox('home_phone', customFormData.i_home_phone);
        drawBox('cname', customFormData.i_cname);
        drawBox('cregno', customFormData.i_cregno);
        drawBox('cphone', customFormData.i_cphone);
        drawBox('new_cname', customFormData.i_new_cname);
        drawBox('new_cregno', customFormData.i_new_cregno);
        drawBox('new_cphone', customFormData.i_new_cphone);
        drawBox('job', customFormData.i_job);
        drawBox('income', (customFormData.i_income || '').replace(/,/g, ''));
        drawBox('reentry_period', customFormData.i_reentry_period);
        drawBox('email', getUpperVal(customFormData.i_email));

        let refundStr = '';
        if (customFormData.i_refund_bank || customFormData.i_refund_acc) {
          refundStr = `${customFormData.i_refund_bank} / ${customFormData.i_refund_acc}`.replace(/^ \/ | \/ $/g, '');
        }
        drawBox('refund_acc', refundStr);
        drawBox('app_date', `${ty}.${tm}.${td}`);
        drawBox('sign_main', fullFName.replace('\n', ' '));

        const submitter = customFormData.submitter || 'self';
        if (submitter === 'self') {
          drawBox('sign_sub_1', fullFName);
        } else if (submitter === 'spouse') {
          drawBox('sign_sub_2', getUpperVal(customFormData.i_spouse).replace(' ', '\n'));
        } else if (submitter === 'parents') {
          drawBox('sign_sub_3', getUpperVal(customFormData.i_parents).replace(' ', '\n'));
        }

      } else if (docType === 'residence') {
        drawBox('f_nation', getUpperVal(customFormData.i_nation));
        drawBox('f_name', fullFName);
        drawBox('f_arc', customFormData.i_arc);
        drawBox('f_phone', customFormData.i_cellphone);
        drawBox('f_addr', customFormData.i_address_kr);
        drawBox('p_id', customFormData.i_rep_id);
        drawBox('p_nation', '대한민국');

        let pNameStr = customFormData.i_cname;
        if (customFormData.i_rep_name) pNameStr += `(${customFormData.i_rep_name})`;
        drawBox('p_name', pNameStr);

        drawBox('p_phone', customFormData.i_cphone);
        drawBox('rel_employer', 'check');

        const rOwn = customFormData.r_own;
        if (rOwn) {
          drawBox(rOwn, 'check');
        }

        const rType = customFormData.r_type;
        if (rType) {
          drawBox(rType, 'check');
        }

        const start = customFormData.i_dorm_start;
        if (start) {
          const p = start.split('-');
          if (p.length === 3) {
            drawBox('start_y', p[0]);
            drawBox('start_m', p[1]);
            drawBox('start_d', p[2]);
          }
        }

        drawBox('sign_y', ty);
        drawBox('sign_m', tm);
        drawBox('sign_d', td);
        drawBox('p_sign_name', customFormData.i_rep_name);
        drawBox('p_company', customFormData.i_cname);

      } else if (docType === 'guarantee') {
        drawBox('f_surname', getUpperVal(customFormData.i_surname));
        drawBox('f_givenname', getUpperVal(customFormData.i_givenname));

        const gFSex = customFormData.i_gender;
        if (gFSex === 'M') drawBox('f_sex_m', 'check');
        if (gFSex === 'F') drawBox('f_sex_f', 'check');

        drawBox('f_dob', customFormData.i_dob);
        drawBox('f_nation', getUpperVal(customFormData.i_nation));
        drawBox('f_pass', getUpperVal(customFormData.i_passport));
        drawBox('f_phone', customFormData.i_cellphone);
        drawBox('f_addr', customFormData.i_address_kr);
        drawBox('f_purpose', '취업');
        drawBox('p_name', customFormData.i_rep_name);
        drawBox('p_nation', '대한민국');

        const gPSex = customFormData.i_rep_gender;
        if (gPSex === 'M') drawBox('p_sex_m', 'check');
        if (gPSex === 'F') drawBox('p_sex_f', 'check');

        drawBox('p_dob', customFormData.i_rep_id);
        drawBox('p_phone', customFormData.i_cphone);
        drawBox('p_addr', customFormData.i_caddr);
        drawBox('p_rel', '고용주');
        
        const periodStr = (customFormData.i_guar_start && customFormData.i_guar_end)
          ? `${customFormData.i_guar_start} ~ ${customFormData.i_guar_end}`
          : '2년 (최장 4년)';
        drawBox('p_period', periodStr);
        
        drawBox('p_company', customFormData.i_cname);
        drawBox('p_job', '대표이사');
        drawBox('p_caddr', customFormData.i_caddr);

        drawBox('sign_y', ty);
        drawBox('sign_m', tm);
        drawBox('sign_d', td);
        drawBox('p_sign_name', customFormData.i_rep_name);

      } else if (docType === 'income') {
        drawBox('f_name', fullFName);
        drawBox('f_arc', customFormData.i_arc);
        drawBox('f_nation', getUpperVal(customFormData.i_nation));
        drawBox('f_sojourn_status', customFormData.visaType);
        drawBox('f_visa', customFormData.visaType);
        drawBox('f_phone', customFormData.i_cellphone || customFormData.i_phone);
        drawBox('f_email', getUpperVal(customFormData.i_email));
        drawBox('c_regno', customFormData.i_cregno);
        drawBox('c_name', customFormData.i_cname);
        drawBox('job_code', customFormData.i_job_code || '7431');
        drawBox('c_job_code', customFormData.i_job_code || '7431');
        drawBox('job_title', customFormData.i_job || '조선용접원');
        drawBox('c_job', customFormData.i_job || '조선용접원');
        const annualIncomeWon = customFormData.i_income ? `${customFormData.i_income}0,000` : '36,000,000';
        drawBox('annual_income', annualIncomeWon);
        drawBox('c_income_won', annualIncomeWon);
        drawBox('income_tax_proof', 'check');
        drawBox('c_income_bracket', 'check');
        drawBox('sign_y', ty);
        drawBox('sign_m', tm);
        drawBox('sign_d', td);
        drawBox('declarant_name', fullFName);
        drawBox('f_sign', fullFName);
      } else {
        // Any custom registered document: resolve all configured coordinates!
        Object.keys(coords || {}).forEach(k => {
          const res = resolveFieldValueForCoord(k, customFormData, customTextMap);
          if (res.isChecked || res.display) {
            drawBox(k, res.isChecked ? 'check' : res.display);
          }
        });
      }

      // Also draw any custom keyed-in fields added to any document
      Object.keys(coords || {}).forEach(k => {
        if (k.startsWith('custom_') || customTextMap[k]) {
          const res = resolveFieldValueForCoord(k, customFormData, customTextMap);
          if (res.isChecked || res.display) {
            drawBox(k, res.isChecked ? 'check' : res.display);
          }
        }
      });

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      } catch (err: any) {
        console.warn(`Template load skipped for ${docType}, building vector document:`, err?.message || err);
      }
    }

    // Fallback: Build a clean professional vector report PDF from scratch if no template uploaded (so user never gets blocked!)
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBuffer);

    // Dedicated renderers for official documents when no template overlay exists
    if (docType === 'e74r_recommend') {
      await renderE74RRecommend(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (docType === 'e74r_score_sheet') {
      await renderE74RScoreSheet(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (docType === 'e74r_personal_stmt') {
      await renderE74RPersonalStmt(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (docType === 'e74r_company_recommend') {
      await renderE74RCompanyRecommend(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (docType === 'contract_std') {
      await renderLaborContract(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (docType === 'employment_cert') {
      await renderEmploymentCert(pdfDoc, font, customFormData);
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    }

    const page = pdfDoc.addPage([595, 842]);

    // Title Block
    page.drawRectangle({
      x: 35,
      y: 740,
      width: 525,
      height: 60,
      color: rgb(0.05, 0.12, 0.28) // HD Hyundai modern Deep Navy
    });

    const docTypeTitles: Record<string, string> = {
      main: '통합신청서 (출입국관리법 시행규칙 별지 제34호)',
      residence: '거주/숙소제공 확인서 (체류지 입증 표준 서식)',
      guarantee: '신원보증서 (출입국관리법 시행규칙 별지 제129호)',
      income: '외국인 직업 및 연간 소득금액 신고서 (법정 서식)'
    };
    const docDisplayTitle = docTypeTitles[docType] || customDocList.find(d => d.id === docType)?.title || '출입국 제출 서식';

    page.drawText('HD HYUNDAI SAMHO IMMIGRATION SYSTEM', { x: 50, y: 775, size: 9, font: font, color: rgb(0.48, 0.81, 0.29) }); // Emerald accent
    page.drawText(docDisplayTitle.toUpperCase(), { x: 50, y: 752, size: 12, font: font, color: rgb(1,1,1) });

    // Table content drawer
    const drawRow = (label: string, value: string, yPos: number, isSection: boolean = false) => {
      if (isSection) {
        page.drawRectangle({ x: 35, y: yPos - 3, width: 525, height: 18, color: rgb(0.92, 0.95, 0.98) });
        page.drawText(label, { x: 42, y: yPos, size: 9, font: font, color: rgb(0.1, 0.2, 0.4) });
      } else {
        page.drawLine({ start: { x: 35, y: yPos - 6 }, end: { x: 560, y: yPos - 6 }, color: rgb(0.92, 0.92, 0.92) });
        page.drawText(label, { x: 42, y: yPos, size: 9, font: font, color: rgb(0.3, 0.4, 0.5) });
        page.drawText(value || '-', { x: 200, y: yPos, size: 9, font: font, color: rgb(0.1, 0.1, 0.15) });
      }
    };

    let curY = 700;
    
    drawRow('1. 외국인 인적사항 (Foreigner Personal Details)', '', curY, true); curY -= 25;
    drawRow('성명 (Full Name)', `${customFormData.i_surname} ${customFormData.i_givenname}`.toUpperCase(), curY); curY -= 18;
    drawRow('외국인등록번호 (ARC No.)', customFormData.i_arc, curY); curY -= 18;
    drawRow('여권번호 (Passport No.)', customFormData.i_passport, curY); curY -= 18;
    drawRow('생년월일 / 성별', `${customFormData.i_dob || '-'} / ${customFormData.i_gender === 'M' ? '남성(M)' : '여성(F)'}`, curY); curY -= 18;
    drawRow('국적 (Nationality)', customFormData.i_nation, curY); curY -= 18;
    drawRow('체류자격 / 민원유형', `${customFormData.visaType} / ${reqNames[customFormData.reqType] || customFormData.reqType}`, curY); curY -= 18;
    drawRow('대한민국 내 체류지 (Korea Address)', customFormData.i_address_kr, curY); curY -= 25;

    drawRow('2. 근무처 및 직업·소득 현황 (Workplace & Income Declaration)', '', curY, true); curY -= 25;
    drawRow('사업장 상호 (Company Name)', customFormData.i_cname, curY); curY -= 18;
    drawRow('사업자등록번호 (Business Reg. No.)', customFormData.i_cregno, curY); curY -= 18;
    drawRow('대표자 성명 (Representative)', customFormData.i_rep_name, curY); curY -= 18;
    drawRow('대표자 식별번호', customFormData.i_rep_id || '보안 마스킹', curY); curY -= 18;
    drawRow('직업명 및 한국표준직업분류 코드', `${customFormData.i_job || '조선용접원'} (KSCO Code: ${customFormData.i_job_code || '7431'})`, curY); curY -= 18;
    drawRow('연간 소득금액 (Annual Income)', customFormData.i_income ? `${customFormData.i_income} 만원 (${customFormData.i_income}0,000 원)` : '36,000,000 원', curY); curY -= 18;
    drawRow('숙소 제공 개시일 (Accommodation Start)', customFormData.i_dorm_start || '미지정', curY); curY -= 25;

    drawRow('3. 확인 및 서명 (Declaration & Submission)', '', curY, true); curY -= 25;
    const todayStr = new Date().toISOString().split('T')[0];
    drawRow('신고/작성 일자 (Date)', todayStr, curY); curY -= 18;
    drawRow('신고인 (Declarant)', `${customFormData.i_surname} ${customFormData.i_givenname} (서명 또는 인)`, curY); curY -= 35;

    // Stamp block
    page.drawText('HD HYUNDAI SAMHO CO., LTD. CHIEF IMMIGRATION OFFICER (OFFICIAL STAMP)', { x: 35, y: curY, size: 8, font: font, color: rgb(0.2, 0.4, 0.2) });
    page.drawCircle({ x: 480, y: curY + 10, size: 25, color: rgb(0.95, 0.9, 0.9), borderColor: rgb(0.85, 0.1, 0.1), borderWidth: 2 });
    page.drawText('대표이사', { x: 462, y: curY + 13, size: 7, font: font, color: rgb(0.8, 0, 0) });
    page.drawText('김재을인', { x: 462, y: curY + 3, size: 7, font: font, color: rgb(0.8, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  // Compile selected PDFs
  const generateSelectedPDFs = async () => {
    if (attachments.length === 0) {
      showConfirm(
        currentLang === 'kr' ? '서류 업로드 필요' : currentLang === 'en' ? 'Upload Required' : currentLang === 'ne' ? 'कागजात अपलोड आवश्यक' : 'Yêu cầu tải lên',
        currentLang === 'kr' 
          ? '검증용 증빙 서류(여권, 비자 등)가 업로드되어 있지 않습니다. 이대로 서류 일괄 생성을 진행하시겠습니까?' 
          : currentLang === 'en' 
          ? 'Verification documents have not been uploaded. Do you still want to proceed with document generation?' 
          : currentLang === 'ne'
          ? 'प्रमाणीकरण कागजातहरू अपलोड गरिएको छैन। के तपाईं अझै पनि कागजात सिर्जना गर्न चाहनुहुन्छ?'
          : 'Tài liệu xác minh chưa được tải lên. Bạn vẫn muốn tiếp tục tạo tài liệu?',
        () => {
          proceedGenerateSelectedPDFs();
        }
      );
    } else {
      proceedGenerateSelectedPDFs();
    }
  };

  const proceedGenerateSelectedPDFs = async () => {
    setIsOCRProcessing(true); // show loader on compilation as well
    setDownloadLinks([]);

    try {
      const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      const fontBuffer = await fontResponse.arrayBuffer();

      const links: { name: string; url: string; filename: string }[] = [];

      if (selectedDocs.main) {
        const blob = await drawSingleDocBlob('main', fontBuffer, formData);
        links.push({
          name: '통합신청서 (별지 제34호) PDF',
          url: URL.createObjectURL(blob),
          filename: `통합신청서_${formData.i_surname}.pdf`
        });
      }
      if (selectedDocs.residence) {
        const blob = await drawSingleDocBlob('residence', fontBuffer, formData);
        links.push({
          name: '거주/숙소제공 확인서 PDF',
          url: URL.createObjectURL(blob),
          filename: `거주숙소제공확인서_${formData.i_surname}.pdf`
        });
      }
      if (selectedDocs.guarantee) {
        const blob = await drawSingleDocBlob('guarantee', fontBuffer, formData);
        links.push({
          name: '신원보증서 (별지 제129호) PDF',
          url: URL.createObjectURL(blob),
          filename: `신원보증서_${formData.i_surname}.pdf`
        });
      }
      if (selectedDocs.income) {
        const blob = await drawSingleDocBlob('income', fontBuffer, formData);
        links.push({
          name: '외국인 직업 및 연간 소득금액 신고서 PDF',
          url: URL.createObjectURL(blob),
          filename: `외국인직업및소득신고서_${formData.i_surname}.pdf`
        });
      }

      // Any selected custom registered documents!
      for (const cDoc of customDocList) {
        if (selectedDocs[cDoc.id]) {
          const blob = await drawSingleDocBlob(cDoc.id, fontBuffer, formData);
          links.push({
            name: `${cDoc.title} PDF`,
            url: URL.createObjectURL(blob),
            filename: `${cDoc.title.replace(/\s+/g, '_')}_${formData.i_surname || '외국인'}.pdf`
          });
        }
      }

      setDownloadLinks(links);
      showAlert('서류 생성 완료 (Success)', '인쇄할 법정 서식이 성공적으로 생성되었습니다. 아래 다운로드 링크를 통해 저장하세요.', 'success');
    } catch(e: any) {
      showAlert('완성 실패 (Failed)', e.message || '인쇄 배치 생성에 문제가 있습니다.', 'error');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Excel template downloader
  const downloadExcelTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('비자명단');

      worksheet.columns = [
        { header: '성(Surname)', key: 'surname', width: 20 },
        { header: '명(Given Name)', key: 'givenname', width: 25 },
        { header: '생년월일(8자리숫자)', key: 'dob', width: 20 },
        { header: '성별', key: 'gender', width: 10 },
        { header: '국적', key: 'nation', width: 15 },
        { header: '외국인등록번호(13자리)', key: 'arc', width: 22 },
        { header: '여권번호', key: 'passport', width: 15 },
        { header: '여권발급일(8자리숫자)', key: 'pass_issue', width: 22 },
        { header: '여권만료일(8자리숫자)', key: 'pass_exp', width: 22 },
        { header: '대한민국주소', key: 'addr_kr', width: 35 },
        { header: '휴대전화', key: 'cellphone', width: 15 },
        { header: '일반전화', key: 'phone', width: 15 },
        { header: '본국주소', key: 'addr_home', width: 25 },
        { header: '본국전화번호', key: 'home_phone', width: 20 },
        { header: '이메일', key: 'email', width: 25 },
        { header: '제출자', key: 'submitter', width: 15 },
        { header: '대리인영문성명', key: 'proxy_name', width: 20 },
        { header: '원근무처_명칭', key: 'cname', width: 25 },
        { header: '원근무처_사업자번호(10자리)', key: 'cregno', width: 25 },
        { header: '원근무처_대표자명', key: 'rep_name', width: 15 },
        { header: '원근무처_대표자주민번호', key: 'rep_id', width: 25 },
        { header: '원근무처_대표자성별', key: 'rep_gender', width: 20 },
        { header: '원근무처_주소', key: 'caddr', width: 35 },
        { header: '원근무처_전화번호', key: 'cphone', width: 20 },
        { header: '예정근무처_명칭', key: 'new_cname', width: 20 },
        { header: '예정근무처_사업자번호', key: 'new_cregno', width: 20 },
        { header: '예정근무처_전화번호', key: 'new_cphone', width: 20 },
        { header: '숙소_소유형태', key: 'dorm_own', width: 15 },
        { header: '숙소_주거형태', key: 'dorm_type', width: 15 },
        { header: '숙소_제공시작일(8자리숫자)', key: 'dorm_start', width: 25 },
        { header: '직업', key: 'job', width: 15 },
        { header: '연소득(만원)', key: 'income', width: 15 },
        { header: '재입국신청기간', key: 'reentry', width: 15 },
        { header: '환급은행', key: 'refund_bank', width: 15 },
        { header: '환급계좌번호', key: 'refund_acc', width: 25 }
      ];

      // 헤더 스타일 지정 (세련된 녹색 계열)
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        cell.font = { bold: true, color: { argb: 'FF1F4E78' } };
        cell.border = { bottom: { style: 'thin' } };
      });

      // 샘플 데이터 추가
      worksheet.addRow({
        surname: 'BUI', givenname: 'QUOC TINH', dob: '19800812', gender: 'M', nation: 'VIETNAM', 
        arc: '800812-5000000', passport: 'E03861791', pass_issue: '20200101', pass_exp: '20300101', addr_kr: '전라남도 영암군 삼호읍 신항로 10', cellphone: '01012345678', 
        phone: '', addr_home: 'SON HA, THAI THUY', home_phone: '+84 00-000-0000', email: 'example@email.com', submitter: '본인', proxy_name: '', 
        cname: '에이치디현대삼호 주식회사', cregno: '4118119799', rep_name: '김재을', rep_id: '650101-1000000', rep_gender: 'M', caddr: '전라남도 영암군 삼호읍 대불로 93', 
        cphone: '0614602114', new_cname: '', new_cregno: '', new_cphone: '', dorm_own: '자가', dorm_type: '기숙사', dorm_start: '20240518', 
        job: '조선용접공', income: '3000', reentry: '1년', refund_bank: '신한은행', refund_acc: '110-123-456789'
      });

      // 엑셀 표시 형식(numFmt) 설정
      const formatCols = ['dob', 'pass_issue', 'pass_exp', 'dorm_start', 'arc', 'rep_id', 'cregno', 'new_cregno'];
      formatCols.forEach(colKey => {
        const col = worksheet.getColumn(colKey);
        if (col) col.numFmt = '@'; // 텍스트로 보존
      });

      const textFormatCols = ['cellphone', 'phone', 'cphone', 'new_cphone'];
      textFormatCols.forEach(colKey => {
        const col = worksheet.getColumn(colKey);
        if (col) col.numFmt = '@';
      });

      // 드롭다운(Data Validation) 세팅
      for (let i = 2; i <= 100; i++) {
        worksheet.getCell('D' + i).dataValidation = { type: 'list', allowBlank: true, formulae: ['"M,F"'] };
        worksheet.getCell('P' + i).dataValidation = { type: 'list', allowBlank: true, formulae: ['"본인,배우자,부모"'] };
        worksheet.getCell('V' + i).dataValidation = { type: 'list', allowBlank: true, formulae: ['"M,F"'] };
        worksheet.getCell('AB' + i).dataValidation = { type: 'list', allowBlank: true, formulae: ['"자가,임대,기타"'] };
        worksheet.getCell('AC' + i).dataValidation = { type: 'list', allowBlank: true, formulae: ['"기숙사,개인주택,숙박시설"'] };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'HD현대삼호_비자일괄처리_템플릿.xlsx');
      showAlert('다운로드 완료', '작업용 표준 드롭다운 양식 엑셀을 내려받았습니다.', 'success');
    } catch(err) {
      showAlert('양식 생성 실패', '엑셀 빌더 실행 오류가 발생했습니다.', 'error');
    }
  };

  // Upload and Process Excel batch (converts rows to zipped PDFs)
  const processExcelBatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExcelProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('시트 템플릿을 불러올 수 없거나 빈 파일입니다.');
      }

      // Read headers dynamically
      const headersRow = worksheet.getRow(1);
      const headers: string[] = [];
      headersRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let val = '';
        if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value).trim();
        }
        headers[colNumber] = val;
      });

      const hasRequiredHeaders = headers.some(h => h && (h.includes('성(Surname)') || h.includes('명(Given Name)') || h.includes('외국인등록번호')));
      if (!hasRequiredHeaders) {
        throw new Error(currentLang === 'kr' 
          ? '올바른 표준 엑셀 템플릿 양식이 아닙니다. 상단의 [표준 템플릿 다운로드] 버튼을 이용해 지정 양식을 활용해 주세요.' 
          : currentLang === 'en'
          ? 'Invalid standard excel template format. Please download and use the provided practice template.'
          : currentLang === 'ne'
          ? 'अवैध मानक एक्सेल टेम्प्लेट ढाँचा। कृपया प्रदान गरिएको टेम्प्लेट डाउनलोड गरी प्रयोग गर्नुहोस्।'
          : 'Định dạng mẫu Excel không hợp lệ. Vui lòng tải và sử dụng mẫu chuẩn.');
      }

      const rows: any[] = [];
      worksheet.eachRow((row, number) => {
        if (number === 1) return; // Skip headers
        
        const rowData: Record<string, string> = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber];
          if (!header) return;

          let val = cell.value;
          if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            val = `${y}-${m}-${d}`;
          } else if (val && typeof val === 'object') {
            if ('richText' in (val as any) && Array.isArray((val as any).richText)) {
              val = (val as any).richText.map((t: any) => t.text || '').join('').trim();
            } else if ('text' in (val as any)) {
              val = String((val as any).text || '').trim();
            } else {
              val = '';
            }
          }

          let strVal = val !== null && val !== undefined ? String(val).trim() : '';

          // JS 기반 자동 포맷터 (생년월일, 등록번호, 전화번호 하이픈 보정)
          if (strVal && !strVal.includes('-')) {
            let onlyNum = strVal.replace(/[^0-9]/g, '');
            
            if (header.includes('생년월일') || header.includes('발급일') || header.includes('만료일') || header.includes('시작일') || header.includes('제공시작일')) {
              if (onlyNum.length === 8) {
                strVal = onlyNum.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
              }
            } else if (header.includes('등록번호') || header.includes('주민번호')) {
              if (onlyNum.length === 13) {
                strVal = onlyNum.replace(/(\d{6})(\d{7})/, '$1-$2');
              }
            } else if (header.includes('사업자번호')) {
              if (onlyNum.length === 10) {
                strVal = onlyNum.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
              }
            } else if ((header.includes('전화') || header.includes('휴대')) && !header.includes('본국')) {
              if (!onlyNum.startsWith('0') && onlyNum.length >= 8 && onlyNum.length <= 10) {
                if (!(onlyNum.length === 8 && ['15','16','18','19'].includes(onlyNum.substring(0,2)))) {
                  onlyNum = '0' + onlyNum;
                }
              }
              // 하이픈 자동 삽입
              if (onlyNum.startsWith('02')) {
                if (onlyNum.length === 9) strVal = onlyNum.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
                else if (onlyNum.length === 10) strVal = onlyNum.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                else strVal = onlyNum;
              } else if (onlyNum.length === 8 && !onlyNum.startsWith('0')) {
                strVal = onlyNum.replace(/(\d{4})(\d{4})/, '$1-$2');
              } else {
                if (onlyNum.length === 10) strVal = onlyNum.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                else if (onlyNum.length === 11) strVal = onlyNum.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
                else strVal = onlyNum;
              }
            }
          }

          rowData[header] = strVal;
        });

        // 성이나 명, 또는 등록번호가 하나라도 존재하면 유효한 행으로 인식
        if (rowData['성(Surname)'] || rowData['명(Given Name)'] || rowData['외국인등록번호(13자리)']) {
          rows.push(rowData);
        }
      });

      if (rows.length === 0) {
        throw new Error('유효한 직원 행 데이터가 발견되지 않았습니다. 워크시트에서 성(Surname) 혹은 명(Given Name) 열을 채워 넣으십시오.');
      }

      const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf';
      const fontBuffer = await (await fetch(fontUrl)).arrayBuffer();
      
      const zip = new JSZip();

      // Mapping translators
      const submitterMap: Record<string, SubmitterType> = { "본인": "self", "배우자": "spouse", "부모": "parents" };
      const ownMap: Record<string, OwnershipType> = { "자가": "own_self", "임대": "own_rent", "기타": "own_other" };
      const typeMap: Record<string, HousingType> = { "기숙사": "type_dorm", "개인주택": "type_private", "숙박시설": "type_hotel" };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        const rawSubmitter = row['제출자'] || '본인';
        const mappedSubmitter = submitterMap[rawSubmitter] || 'self';

        const rawOwn = row['숙소_소유형태'] || '자가';
        const mappedOwn = ownMap[rawOwn] || 'own_self';

        const rawType = row['숙소_주거형태'] || '기숙사';
        const mappedType = typeMap[rawType] || 'type_dorm';

        const rawRepGender = row['원근무처_대표자성별'] || 'M';
        const repGender: 'M' | 'F' = (rawRepGender.toUpperCase().trim().includes('F') || rawRepGender.includes('여')) ? 'F' : 'M';

        const rawGender = row['성별'] || 'M';
        const empGender: 'M' | 'F' = (rawGender.toUpperCase().trim().includes('F') || rawGender.includes('여')) ? 'F' : 'M';

        const dummyFormData: FormData = {
          visaType: formData.visaType,
          reqType: formData.reqType,
          val_change_status: formData.val_change_status,
          submitter: mappedSubmitter,
          
          i_surname: row['성(Surname)'] || formData.i_surname,
          i_givenname: row['명(Given Name)'] || formData.i_givenname,
          i_dob: row['생년월일(8자리숫자)'] || formData.i_dob,
          i_gender: empGender,
          i_nation: row['국적'] || formData.i_nation,
          i_arc: row['외국인등록번호(13자리)'] || formData.i_arc,
          i_passport: row['여권번호'] || formData.i_passport,
          i_pass_issue: row['여권발급일(8자리숫자)'] || formData.i_pass_issue,
          i_pass_exp: row['여권만료일(8자리숫자)'] || formData.i_pass_exp,
          
          i_spouse: mappedSubmitter === 'spouse' ? (row['대리인영문성명'] || formData.i_spouse) : '',
          i_parents: mappedSubmitter === 'parents' ? (row['대리인영문성명'] || formData.i_parents) : '',
          i_address_kr: row['대한민국주소'] || formData.i_address_kr,
          i_cellphone: row['휴대전화'] || formData.i_cellphone,
          i_phone: row['일반전화'] || formData.i_phone,
          i_address_home: row['본국주소'] || formData.i_address_home,
          i_home_phone: row['본국전화번호'] || formData.i_home_phone,
          i_email: row['이메일'] || formData.i_email,
          
          i_job: row['직업'] || formData.i_job,
          i_job_code: row['표준직업코드'] || formData.i_job_code || '7431',
          i_income: row['연소득(만원)'] || formData.i_income,
          i_reentry_period: row['재입국신청기간'] || formData.i_reentry_period,
          i_refund_bank: row['환급은행'] || formData.i_refund_bank,
          i_refund_acc: row['환급계좌번호'] || formData.i_refund_acc,
          
          i_cname: row['원근무처_명칭'] || formData.i_cname,
          i_cregno: row['원근무처_사업자번호(10자리)'] || formData.i_cregno,
          i_rep_name: row['원근무처_대표자명'] || formData.i_rep_name,
          i_rep_id: row['원근무처_대표자주민번호'] || formData.i_rep_id,
          i_rep_gender: repGender,
          i_caddr: row['원근무처_주소'] || formData.i_caddr,
          i_cphone: row['원근무처_전화번호'] || formData.i_cphone,
          
          i_new_cname: row['예정근무처_명칭'] || formData.i_new_cname,
          i_new_cregno: row['예정근무처_사업자번호'] || formData.i_new_cregno,
          i_new_cphone: row['예정근무처_전화번호'] || formData.i_new_cphone,
          
          r_own: mappedOwn,
          r_type: mappedType,
          i_dorm_start: row['숙소_제공시작일(8자리숫자)'] || formData.i_dorm_start,
          i_guar_start: row['신원보증시작일(8자리숫자)'] || formData.i_guar_start,
          i_guar_end: row['신원보증만료일(8자리숫자)'] || formData.i_guar_end
        };

        const nameLabel = `${dummyFormData.i_surname}_${dummyFormData.i_givenname}`.toUpperCase().replace(/\s+/g, '_');

        // Draw and write to ZIP
        const mainBlob = await drawSingleDocBlob('main', fontBuffer, dummyFormData);
        zip.file(`${nameLabel}_통합신청서.pdf`, mainBlob);

        const isResNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg'].includes(dummyFormData.reqType);
        if (isResNeeded) {
          const resBlob = await drawSingleDocBlob('residence', fontBuffer, dummyFormData);
          zip.file(`${nameLabel}_거주숙소제공확인서.pdf`, resBlob);
        }

        const isGuarNeeded = dummyFormData.visaType === 'E-7' && ['chk_extension', 'chk_change_status'].includes(dummyFormData.reqType);
        if (isGuarNeeded) {
          const guarBlob = await drawSingleDocBlob('guarantee', fontBuffer, dummyFormData);
          zip.file(`${nameLabel}_신원보증서.pdf`, guarBlob);
        }

        const isIncomeNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg', 'chk_change_status'].includes(dummyFormData.reqType);
        if (isIncomeNeeded) {
          const incBlob = await drawSingleDocBlob('income', fontBuffer, dummyFormData);
          zip.file(`${nameLabel}_직업및소득금액신고서.pdf`, incBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `HD현대삼호_비자일괄배치_총_${rows.length}명.zip`);
      showAlert('일괄 빌드 성공! (Done)', `총 ${rows.length}명의 서류 연동 생성이 완전히 일치 인코딩되어 ZIP 패키지로 다운로드되었습니다.`, 'success');

    } catch(err: any) {
      showAlert('엑셀 가공 실패', err.message || '파일 추출 중 오류가 발생했습니다. 헤더 형식을 수정하십시오.', 'error');
    } finally {
      setIsExcelProcessing(false);
      e.target.value = ''; // clean
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropVerificationDocs = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      setAttachments(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          name: file.name,
          base64: base64,
          mimeType: file.type
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-300 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      {/* Subtle Corporate Background with Architectural Ambient Light */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#07080d]">
        <img 
          src="/yard-background.png" 
          alt="Company Yard Background"
          className="w-full h-full object-cover opacity-20 filter brightness-75 contrast-125"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/15 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-cyan-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/85 to-[#07080d]/40" />
      </div>

      {/* Dynamic Navigation Toolbar & Navbar */}
      <header className="bg-black/60 backdrop-blur-md border-b border-white/8 text-white sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleHomeClick} 
              className="p-1.5 sm:p-2 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 rounded-xl transition shadow-md cursor-pointer shrink-0"
              title="처음으로"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            </button>
            <div className="flex items-center gap-2 text-left">
              <img src="/hd-hyundai-samho-ci.png" alt="HD현대삼호" className="h-5 sm:h-6 object-contain" />
              <h1 className="text-sm sm:text-base font-extrabold text-slate-200 tracking-tight leading-none whitespace-nowrap">
                비자지원
              </h1>
            </div>
          </div>

          {step === 0 ? (
            <div className="flex items-center gap-2">
              {formData.i_cname && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate max-w-[150px]">{formData.i_cname}</span>
                </div>
              )}
              <button 
                onClick={handleResetData}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white rounded-xl transition border border-white/10 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                title="입력 데이터 초기화"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400 transition-colors" />
                <span className="hidden md:inline">초기화</span>
              </button>
              <LanguageFlagPicker 
                currentLang={currentLang} 
                onSelectLang={setCurrentLang} 
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => setIsWorkplaceModalOpen(true)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-blue-950/40 hover:bg-blue-900/60 active:bg-blue-800 text-blue-300 rounded-xl flex items-center justify-center transition border border-blue-500/30 cursor-pointer shrink-0 shadow-sm group"
                title="협력사 및 사업장 프로필 관리"
              >
                <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => setIsDBModalOpen(true)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30 cursor-pointer shrink-0 group"
                title={t('btn_db')}
              >
                <Users className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-emerald-950/40 hover:bg-emerald-900/60 active:bg-emerald-800 text-emerald-300 rounded-xl flex items-center justify-center transition border border-emerald-500/30 cursor-pointer shrink-0 shadow-sm group"
                title="개인정보 처리방침 및 즉시 파기"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={handleResetData}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-amber-950/40 hover:bg-amber-900/60 active:bg-amber-800 text-amber-300 rounded-xl flex items-center justify-center transition border border-amber-500/30 cursor-pointer shrink-0 shadow-sm group"
                title="전체 데이터 초기화"
              >
                <RotateCw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              <LanguageFlagPicker 
                currentLang={currentLang} 
                onSelectLang={setCurrentLang} 
              />
            </div>
          )}
        </div>
        
        {/* Multi-Device Optimized Step Indicator */}
        {step !== 0 && (
          <div className="bg-[#0A0A0C]/70 border-t border-white/10 transition-all duration-300 backdrop-blur-md">
            {/* MOBILE (<640px) STEP PROGRESS BAR: Thumb-friendly, no squishing */}
            <div className="sm:hidden px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/30 shrink-0">
                    {isBatchMode 
                      ? (step === 1 ? '01 / 02' : '02 / 02')
                      : `0${step} / 07`}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {isBatchMode 
                      ? (step === 1 ? t('s1_step') : t('s_excel_step'))
                      : t(`s${step}_step`)}
                  </span>
                </div>
                {/* Mobile Prev / Next Jump Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isBatchMode) {
                        if (step === 'excel') handlePrevStep(1);
                        else handlePrevStep(0);
                      } else {
                        if (typeof step === 'number' && step > 1) handlePrevStep(step - 1);
                        else handlePrevStep(0);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 active:bg-white/15 transition cursor-pointer"
                    title="이전 단계"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isBatchMode) {
                        if (step === 1) handleNextStep('excel');
                      } else {
                        if (typeof step === 'number' && step < 7) handleNextStep(step + 1);
                      }
                    }}
                    disabled={isBatchMode ? step === 'excel' : step === 7}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 active:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="다음 단계"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* 7-Segment Touch Indicator Bar */}
              <div className="grid grid-cols-7 gap-1.5">
                {(isBatchMode ? [1, 2] : [1, 2, 3, 4, 5, 6, 7]).map((num) => {
                  const isActive = isBatchMode 
                    ? (num === 1 ? step === 1 : step === 'excel')
                    : step === num;
                  const isCompleted = isBatchMode
                    ? (num === 1 ? step === 'excel' : false)
                    : (typeof step === 'number' && step > num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (isBatchMode) {
                          if (num === 1) handleNextStep(1);
                          else if (num === 2) handleNextStep('excel');
                        } else {
                          handleNextStep(num as number);
                        }
                      }}
                      className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-y-110' 
                          : isCompleted 
                          ? 'bg-emerald-500/80' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      title={`Step ${num}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* TABLET & PC (>=640px) STEP PROGRESS BAR: Rich labels & clean flow */}
            <div className="hidden sm:flex max-w-7xl mx-auto px-4 lg:px-8 py-3 items-center justify-between w-full text-xs font-bold gap-1 sm:gap-2">
              {(isBatchMode ? [1, 2] : [1, 2, 3, 4, 5, 6, 7]).map((num) => {
                const isActive = isBatchMode 
                  ? (num === 1 ? step === 1 : step === 'excel')
                  : step === num;
                const isCompleted = isBatchMode
                  ? (num === 1 ? step === 'excel' : false)
                  : (typeof step === 'number' && step > num);
                const stepLabel = (isBatchMode && num === 2) ? t('s_excel_step') : t(`s${num}_step`);
                const isLast = isBatchMode ? num === 2 : num === 7;

                return (
                  <div key={num} className="flex-1 flex items-center justify-center min-w-0">
                    <button 
                      onClick={() => {
                        if (isBatchMode) {
                          if (num === 1) handleNextStep(1);
                          else if (num === 2) handleNextStep('excel');
                        } else {
                          handleNextStep(num as number);
                        }
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-white/5 active:bg-white/10 px-1 sm:px-2 py-1 rounded-xl transition-all border-0 bg-transparent text-left focus:outline-none min-w-0"
                    >
                      <span 
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-200 shrink-0 font-mono ${
                          isActive 
                          ? 'bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.6)] font-bold' 
                          : isCompleted 
                          ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                          : 'bg-white/5 border border-white/10 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : num}
                      </span>
                      {/* Responsive Labels: Visible on tablet (md:) and desktop (lg:) */}
                      <span className={`hidden md:inline whitespace-nowrap overflow-hidden text-ellipsis text-[11px] lg:text-xs ${isActive ? 'text-white font-extrabold' : 'text-slate-500 font-semibold'}`}>{stepLabel}</span>
                    </button>
                    {!isLast && <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-700 ml-1 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Container: Optimized for PC, Mobile, and Tablet */}
      <main className={`flex-1 w-full mx-auto p-3 xs:p-4 sm:p-6 lg:p-8 flex flex-col justify-center relative z-10 transition-all duration-300 ${step === 0 ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <AnimatePresence mode="wait">
          {/* STEP 0: Modern Minimalist Enterprise Gateway */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl mx-auto py-6 xs:py-8 sm:py-12 md:py-14 space-y-10 sm:space-y-14"
            >
              {/* Refined Minimalist Hero */}
              <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-[11px] sm:text-xs tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="truncate">HD현대삼호 외국인 비자 지원 포털</span>
                </div>

                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  외국인 비자 행정,
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                    빠르고 간편하게 완성하세요
                  </span>
                </h2>

                <p className="text-slate-400 text-xs xs:text-sm sm:text-base font-normal leading-relaxed pt-1">
                  출입국 법정 서식 자동 작성부터 엑셀 대량 생성까지
                  <br className="hidden sm:inline" />
                  협력사 실무를 위한 원스톱 비자 행정 포털입니다.
                </p>
              </div>

              {/* 2 Flagship Action Cards - Clean, Spacious, Confident across Mobile, Tablet, PC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Option 1: Individual Visa Application */}
                <div 
                  onClick={() => {
                    setIsBatchMode(false);
                    handleNextStep(1);
                  }}
                  className="group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-blue-500/50 p-6 sm:p-8 md:p-9 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden active:scale-[0.99]"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
                  
                  <div className="space-y-4 sm:space-y-6 relative z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all">
                      <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                        개별 신청서 작성
                      </h3>
                      <p className="text-slate-400 text-xs xs:text-sm leading-relaxed">
                        외국인등록증 OCR 자동 판독과 단계별 안내를 통해 법정 서식 4종을 즉시 생성합니다.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-3.5 sm:pt-4 border-t border-white/5 flex items-center justify-between text-xs xs:text-sm font-semibold text-blue-400 group-hover:text-blue-300 relative z-10 min-h-[44px]">
                    <span>신청서 작성 시작</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* Option 2: Bulk Excel Batch Processing */}
                <div 
                  onClick={() => {
                    setIsBatchMode(true);
                    handleNextStep(1);
                  }}
                  className="group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/50 p-6 sm:p-8 md:p-9 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden active:scale-[0.99]"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

                  <div className="space-y-4 sm:space-y-6 relative z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all">
                      <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                        엑셀 대량 일괄 생성
                      </h3>
                      <p className="text-slate-400 text-xs xs:text-sm leading-relaxed">
                        표준 엑셀 명부 파일 하나로 다수 인원의 비자 서류를 한 번에 생성하고 압축 다운로드합니다.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-3.5 sm:pt-4 border-t border-white/5 flex items-center justify-between text-xs xs:text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 relative z-10 min-h-[44px]">
                    <span>엑셀 일괄 생성 시작</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Minimalist Management Dock / Tools Toolbar */}
              <div className="pt-2">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    업무 지원 도구
                  </span>
                </div>

                {/* Responsive Grid: Mobile 2 columns, Tablet 3 columns, PC 6 columns in 1 neat row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 max-w-4xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsWorkplaceModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                  >
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">협력사 정보 관리</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDBModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                  >
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">근로자 명부</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCompanyDocRequest()}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                  >
                    <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">서류 요청문 발송</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                  >
                    <FileUp className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">법정 서식 관리</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDebugModalDocType('income');
                      setIsDebugModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                    title="출입국 법정 서식 및 신규 서류 항목 배치 편집"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">서식 맞춤 편집기</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">개인정보 파기</span>
                  </button>
                </div>
              </div>

              {/* Minimal Clean Footer Note */}
              <div className="pt-2 text-center">
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                  HD HYUNDAI SAMHO · 출입국 외국인 체류관리 시스템 · 모든 데이터는 사용자 브라우저에만 안전하게 보관됩니다.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Choose Visa and Request Type */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s1_step')}</span>
                  <span className="inline sm:hidden">01</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s1_title')}</h3>
                <p className="text-sm text-slate-450 mt-1 font-medium">{t('s1_desc')}</p>
              </div>

              {/* Visa Type Selector */}
              <div className="glass p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Milestone className="w-4 h-4 text-slate-500" />
                  <span>{t('s1_visa')}</span>
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { code: 'E-7-4R', labelKr: 'E-7-4R (지역특화 숙련)', descKr: '영암군·전남도 지자체 추천 특화', badge: '인기' },
                    { code: 'E-7-3', labelKr: 'E-7-3 (조선업 기능인력)', descKr: '조선용접원·선박도장원·배관공', badge: '조선업' },
                    { code: 'E-7-4', labelKr: 'E-7-4 (숙련기능 점수제)', descKr: 'K-point 점수제 전환 허가', badge: '' },
                    { code: 'E-9', labelKr: 'E-9 (비전문취업)', descKr: '제조업·조선업 비전문 취업', badge: '' },
                    { code: 'E-7', labelKr: 'E-7 (특정활동 일반)', descKr: '준전문·기술인력 체류허가', badge: '' },
                    { code: 'F-2-R', labelKr: 'F-2-R (지역특화 거주)', descKr: '지자체 추천 5년 거주비자', badge: '' }
                  ].map((vtItem) => {
                    const isSelected = formData.visaType === vtItem.code;
                    return (
                      <label 
                        key={vtItem.code} 
                        className={`flex flex-col justify-between p-3.5 sm:p-4 border rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white/5 transition-all duration-200 min-h-[72px] ${
                          isSelected 
                          ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-white' 
                          : 'border-white/10 bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="radio" 
                              name="visaType" 
                              value={vtItem.code} 
                              checked={isSelected}
                              onChange={(e) => {
                                const newVt = e.target.value as any;
                                handleFormChange('visaType', newVt);
                                if (formData.reqType === 'chk_change_status') {
                                  handleFormChange('val_change_status', newVt);
                                }
                              }}
                              className="w-4 h-4 text-blue-500 border-white/20 cursor-pointer shrink-0" 
                            />
                            <span className={`font-extrabold text-xs sm:text-sm tracking-wide ${isSelected ? 'text-blue-400 font-black' : 'text-slate-200'}`}>
                              {vtItem.labelKr}
                            </span>
                          </div>
                          {vtItem.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                              vtItem.badge === '인기' 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}>
                              {vtItem.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 pl-6.5 mt-1 leading-tight">{vtItem.descKr}</p>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Request Type Selector */}
              <div className="glass p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-slate-500" />
                  <span>{t('s1_req')}</span>
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {(['chk_alien_reg', 'chk_extension', 'chk_change_work', 'chk_reentry', 'chk_reissue', 'chk_change_status'] as const).map((rt) => {
                    const isSelected = formData.reqType === rt;
                    return (
                      <div 
                        key={rt}
                        className={`p-3 sm:p-3.5 border rounded-xl sm:rounded-2xl flex items-center justify-between transition-all duration-200 relative group pr-10 sm:pr-12 min-h-[54px] ${
                          isSelected ? 'bg-blue-950/30 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer flex-1 py-1 min-w-0">
                          <input 
                            type="radio" 
                            name="reqType" 
                            value={rt} 
                            checked={isSelected}
                            onChange={(e) => handleFormChange('reqType', e.target.value)}
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-500 border-white/20 shrink-0 select-none cursor-pointer" 
                          />
                          <span className={`text-xs sm:text-sm font-extrabold leading-tight break-keep ${isSelected ? 'text-blue-400 font-black' : 'text-slate-300'}`}>
                            {t(rt.replace('chk_', 'req_'))}
                          </span>
                        </label>
                        
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocInfoType(rt);
                            setIsDocInfoOpen(true);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition cursor-pointer"
                          title={currentLang === 'kr' ? '상세 서류 보기' : currentLang === 'en' ? 'View Document details' : currentLang === 'ne' ? 'कागजात विवरण हेर्नुहोस्' : 'Xem chi tiết tài liệu'}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Change of Status specifications */}
              {formData.reqType === 'chk_change_status' && (
                <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-500/20 flex flex-col gap-2 step-container-transition">
                  <label className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">{currentLang === 'kr' ? '체류자격 변경 세부 명칭 (예: E-7-4)' : currentLang === 'en' ? 'Specific Visa Type to Change (e.g., E-7-4)' : currentLang === 'ne' ? 'परिवर्तन गर्ने भिसा प्रकार (जस्तै: E-7-4)' : 'Tên chi tiết chuyển đổi tư cách thị thực (VD: E-7-4)'}</label>
                  <input 
                    type="text" 
                    value={formData.val_change_status}
                    onChange={(e) => handleFormChange('val_change_status', e.target.value)}
                    placeholder={currentLang === 'kr' ? '예: E-7-4 (숙련기능 수용자격)' : currentLang === 'en' ? 'e.g. E-7-4 (Skilled Worker)' : currentLang === 'ne' ? 'जस्तै: E-7-4 (दक्ष कामदार)' : 'VD: E-7-4 (Lao động lành nghề)'}
                    className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(0)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={() => isBatchMode ? handleNextStep('excel') : handleNextStep(2)}
                  className="w-2/3 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_25px_rgba(37,99,235,0.4)] cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {isBatchMode ? t('btn_to_excel') : t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP EXCEL: Excel Batch processing */}
          {step === 'excel' && (
            <motion.div 
              key="stepexcel"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s_excel_step')}</span>
                  <span className="inline sm:hidden">02 (Batch)</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s_excel_title')}</h3>
              </div>

              <div className="glass p-5 sm:p-8 rounded-3xl text-center shadow-xl relative overflow-hidden group">
                {/* Background ambient technical glow pattern (Hermetic & Safe) */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600/25 via-blue-600/10 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                </div>

                {isExcelProcessing && (
                  <div className="absolute inset-0 bg-black/85 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-3xl">
                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-3" />
                    <span className="text-sm font-extrabold text-emerald-350 animate-pulse">{t('msg_excel_prog')}</span>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-300">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-xs xs:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6 sm:mb-8 font-medium">
                    대량 처리를 위한 엑셀 파일을 관리할 수 있습니다. 시스템이 제공하는 지정 셀 레이아웃과 데이터 검증 드롭다운 항목 포맷에 맞춰 일괄 업로드하시면 전체 PDF를 생성합니다.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full max-w-sm mx-auto relative z-10">
                  <button 
                    onClick={downloadExcelTemplate} 
                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-slate-300 font-extrabold rounded-xl cursor-pointer text-xs sm:text-sm flex justify-center items-center gap-1.5 transition min-h-[46px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('btn_excel_down')}</span>
                  </button>

                  <label className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-xl cursor-pointer text-xs sm:text-sm flex justify-center items-center gap-1.5 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/20 min-h-[46px]">
                    <Upload className="w-4 h-4" />
                    <span>{currentLang === 'kr' ? '양식 업로드' : currentLang === 'en' ? 'Upload Template' : currentLang === 'ne' ? 'टेम्प्लेट अपलोड' : 'Tải lên biểu mẫu'}</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={processExcelBatch}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex">
                <button 
                  onClick={() => handlePrevStep(1)} 
                  className="w-full py-3.5 sm:py-4 bg-white/5 border border-white/15 hover:bg-white/10 font-bold text-slate-350 rounded-xl transition cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Personal Information of Foreigner */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pb-12 sm:pb-16"
            >
              <div className="pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative">
                <div>
                  <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                    <span className="hidden sm:inline">{t('s2_step') || 'Step 2'}</span>
                    <span className="inline sm:hidden">02</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s2_title') || '외국인 인적사항'}</h3>
                </div>

                {/* AI ID OCR Actions - Responsive Side-by-Side on Mobile */}
                <div className="grid grid-cols-2 sm:flex gap-2 items-center w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 active:bg-emerald-600/40 font-extrabold text-xs border border-emerald-500/30 rounded-xl cursor-pointer transition shadow-md min-h-[42px]"
                  >
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentLang === 'kr' ? '신분증 촬영' : currentLang === 'en' ? 'Scan ID' : currentLang === 'ne' ? 'ID स्क्यान' : 'Chụp Thẻ ID'}</span>
                  </button>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 active:bg-blue-600/40 font-extrabold text-xs border border-blue-500/30 rounded-xl cursor-pointer transition shadow-md min-h-[42px]">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentLang === 'kr' ? '스캔 파일' : currentLang === 'en' ? 'Scan File' : currentLang === 'ne' ? 'फाइल स्क्यान' : 'Quét tệp OCR'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleOCRFile}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Form card elements */}
              <div className={`glass !border-cyan-500/30 bg-cyan-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20 relative transition-all ${activePickerSection === 'personal' ? 'z-[100]' : 'z-10'}`}>
                {isOCRProcessing && (
                  <div className="absolute inset-0 bg-black/90 z-20 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="w-10 h-10 text-blue-550 text-blue-400 animate-spin mb-2" />
                    <span className="text-sm font-extrabold text-blue-400 animate-pulse">
                      {currentLang === 'kr' ? 'AI 신분증 판독 중...' : currentLang === 'en' ? 'AI OCR scanning...' : currentLang === 'ne' ? 'AI ले स्क्यान गर्दैछ...' : 'AI đang phân tích thẻ...'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-semibold text-emerald-350 leading-tight">개인정보보호법 준수 모드: 서류 작성 목적 외 외부 전송 없이 브라우저 메모리에서 안전하게 처리됩니다.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-400 underline hover:text-emerald-300 whitespace-nowrap cursor-pointer shrink-0 self-end xs:self-auto"
                  >
                    보호방침 보기
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="block text-xs font-extrabold text-cyan-400 uppercase tracking-widest">{t('s2_sub1')}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMaskArc(prev => !prev)}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                      title="외국인등록번호 뒷자리 마스킹 여부 토글"
                    >
                      {maskArc ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="font-bold">{maskArc ? 'ARC 마스킹 활성' : 'ARC 원문 표시'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surname */}
                  <div>
                    <label className={`block text-xs font-bold leading-none mb-1.5 uppercase tracking-wider ${errorHighlights.has('i_surname') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_surname')}</label>
                    <input 
                      type="text" 
                      value={formData.i_surname}
                      onChange={(e) => handleFormChange('i_surname', e.target.value)}
                      placeholder="예: BUI"
                      className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold ${
                        errorHighlights.has('i_surname') ? 'error-highlight' : ''
                      }`}
                    />
                  </div>

                  {/* Given Name */}
                  <div>
                    <label className={`block text-xs font-bold leading-none mb-1.5 uppercase tracking-wider ${errorHighlights.has('i_givenname') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_givenname')}</label>
                    <input 
                      type="text" 
                      value={formData.i_givenname}
                      onChange={(e) => handleFormChange('i_givenname', e.target.value)}
                      placeholder="예: QUOC TINH"
                      className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold ${
                        errorHighlights.has('i_givenname') ? 'error-highlight' : ''
                      }`}
                    />
                  </div>

                  {/* Date of birth */}
                  <DatePicker 
                    label={t('l_dob')}
                    value={formData.i_dob}
                    onChange={(val) => handleFormChange('i_dob', val)}
                    placeholder="YYYY-MM-DD"
                    error={errorHighlights.has('i_dob')}
                    onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                  />

                  {/* Gender list */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_gender')}</label>
                    <select 
                      value={formData.i_gender}
                      onChange={(e) => handleFormChange('i_gender', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer appearance-none"
                    >
                      <option value="M" className="bg-[#121217] text-white">{t('gender_m')}</option>
                      <option value="F" className="bg-[#121217] text-white">{t('gender_f')}</option>
                    </select>
                  </div>

                  {/* Nationality with Country Flag Picker */}
                  <CountryFlagPicker
                    value={formData.i_nation}
                    onChange={(val) => handleFormChange('i_nation', val)}
                    error={errorHighlights.has('i_nation')}
                    label={t('l_nation')}
                    placeholder="예: VIETNAM"
                  />

                  {/* ARC Registration */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-bold leading-none uppercase tracking-wider ${errorHighlights.has('i_arc') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_arc')}</label>
                      {maskArc && formData.i_arc && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          미리보기: {formData.i_arc.length > 7 ? `${formData.i_arc.slice(0, 8)}******` : formData.i_arc}
                        </span>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={formData.i_arc}
                      onChange={(e) => handleFormChange('i_arc', formatRegNo(e.target.value))}
                      placeholder="예: 800812-5000000"
                      className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono font-bold ${
                        errorHighlights.has('i_arc') ? 'error-highlight' : ''
                      }`}
                    />
                  </div>

                  {/* Passport number */}
                  <div>
                    <label className={`block text-xs font-bold leading-none mb-1.5 uppercase tracking-wider ${errorHighlights.has('i_passport') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_pass')}</label>
                    <input 
                      type="text" 
                      value={formData.i_passport}
                      onChange={(e) => handleFormChange('i_passport', e.target.value)}
                      placeholder="예: E03861791"
                      className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold ${
                        errorHighlights.has('i_passport') ? 'error-highlight' : ''
                      }`}
                    />
                  </div>

                  {/* Issue/Exp dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker 
                      label={t('l_pass_issue')}
                      value={formData.i_pass_issue}
                      onChange={(val) => handleFormChange('i_pass_issue', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_pass_issue')}
                      onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                    />
                    <DatePicker 
                      label={t('l_pass_exp')}
                      value={formData.i_pass_exp}
                      onChange={(val) => handleFormChange('i_pass_exp', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_pass_exp')}
                      alignRight
                      onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                    />
                  </div>
                </div>
              </div>

              {/* Submitter selector */}
              <div className="glass !border-fuchsia-500/30 bg-fuchsia-500/[0.02] p-5 rounded-3xl shadow-lg shadow-black/20">
                <span className="block text-xs font-extrabold text-fuchsia-400 uppercase tracking-widest mb-3">{t('s2_sub2')}</span>
                <div className="flex flex-wrap gap-4 mb-4">
                  {(['self', 'spouse', 'parents'] as const).map((sub) => (
                    <label key={sub} className="flex items-center gap-2 cursor-pointer font-extrabold text-sm text-slate-350">
                      <input 
                        type="radio" 
                        name="submitter" 
                        value={sub} 
                        checked={formData.submitter === sub}
                        onChange={(e) => handleFormChange('submitter', e.target.value)}
                        className="w-4.5 h-4.5 text-blue-500 border-white/20 bg-black/40 cursor-pointer" 
                      />
                      <span>
                        {sub === 'self' ? t('sub_self') : sub === 'spouse' ? t('sub_spouse') : t('sub_parents')}
                      </span>
                    </label>
                  ))}
                </div>

                {isFamilyProxyNeeded && (
                  <div className="border-t border-white/10 pt-3 flex flex-col gap-3 step-container-transition">
                    {formData.submitter === 'spouse' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-450 mb-1.5 uppercase tracking-wider">{t('l_spouse')}</label>
                        <input 
                          type="text" 
                          value={formData.i_spouse}
                          onChange={(e) => handleFormChange('i_spouse', e.target.value)}
                          placeholder="예: NGUYEN THI B"
                          className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    {formData.submitter === 'parents' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-450 mb-1.5 uppercase tracking-wider">{t('l_parents')}</label>
                        <input 
                          type="text" 
                          value={formData.i_parents}
                          onChange={(e) => handleFormChange('i_parents', e.target.value)}
                          placeholder="예: NGUYEN VAN C"
                          className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="pt-4 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(1)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={() => handleNextStep(3)}
                  className="w-2/3 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_25px_rgba(37,99,235,0.4)] cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Address & Contact */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s3_step')}</span>
                  <span className="inline sm:hidden">03</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s3_title')}</h3>
              </div>

              {/* Primary Address */}
              <div className="glass !border-blue-500/30 bg-blue-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20">
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-widest mb-4">{t('s3_sub1')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-bold leading-none mb-1.5 uppercase tracking-wider ${errorHighlights.has('i_address_kr') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_addr_kr')}</label>
                    <input 
                      type="text" 
                      value={formData.i_address_kr}
                      onChange={(e) => handleFormChange('i_address_kr', e.target.value)}
                      placeholder="예: 전라남도 영암군 삼호읍 대불로 OO, OO기숙사 OO호"
                      className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold ${
                        errorHighlights.has('i_address_kr') ? 'error-highlight' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_cell')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_cellphone}
                      onChange={(e) => handleFormChange('i_cellphone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 010-1234-5678"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_tel')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_phone}
                      onChange={(e) => handleFormChange('i_phone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 061-123-4567"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Home Address */}
              <div className="glass !border-amber-500/30 bg-amber-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20">
                <span className="block text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-4">{t('s3_sub2')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_addr_home')}</label>
                    <input 
                      type="text" 
                      value={formData.i_address_home}
                      onChange={(e) => handleFormChange('i_address_home', e.target.value)}
                      placeholder="예: SON HA, THAI THUY, THAI BINH"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_home_tel')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_home_phone}
                      onChange={(e) => handleFormChange('i_home_phone', e.target.value)}
                      placeholder="예: +84 90-123-4567"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_email')}</label>
                    <input 
                      type="email" 
                      value={formData.i_email}
                      onChange={(e) => handleFormChange('i_email', e.target.value)}
                      placeholder="예: EXAMPLE@EMAIL.COM"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(2)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={() => handleNextStep(4)}
                  className="w-2/3 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_25px_rgba(37,99,235,0.4)] cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Workplace & Residence */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pb-12 sm:pb-16"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s4_step')}</span>
                  <span className="inline sm:hidden">04</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s4_title')}</h3>
              </div>

              {/* Employer / Workplace Information */}
              <div className="glass !border-blue-500/30 bg-blue-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-widest">{t('s4_sub1')}</span>
                  
                  {/* Quick Workplace Profile Selector - Responsive Stack/Row */}
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedWorkplaceId}
                      onChange={(e) => {
                        setSelectedWorkplaceId(e.target.value);
                        const wp = (workplaces || []).find(w => w.id === e.target.value);
                        if (wp) handleSelectWorkplace(wp);
                      }}
                      className="bg-black/50 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-xl px-3 py-2 sm:py-1.5 focus:outline-none focus:border-blue-400 min-h-[38px] truncate"
                    >
                      <option value="" disabled>-- 협력사 프로필 선택 --</option>
                      {(workplaces || []).map(w => (
                        <option key={w.id} value={w.id} className="bg-[#121217] text-white">
                          {w.name || (w as any).companyName} ({w.repName || (w as any).representativeName})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsWorkplaceModalOpen(true)}
                      className="px-3 py-2 sm:py-1.5 bg-blue-600/30 hover:bg-blue-600/50 active:bg-blue-600/60 text-blue-300 text-xs font-bold rounded-xl border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[38px]"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>협력사 관리</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_cname')}</label>
                    <input 
                      type="text" 
                      value={formData.i_cname}
                      onChange={(e) => handleFormChange('i_cname', e.target.value)}
                      placeholder="예: 에이치디현대삼호 주식회사"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_cregno')}</label>
                    <input 
                      type="text" 
                      value={formData.i_cregno}
                      onChange={(e) => handleFormChange('i_cregno', formatBusinessNo(e.target.value))}
                      placeholder="예: 411-81-19799"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_rep_name')}</label>
                    <input 
                      type="text" 
                      value={formData.i_rep_name}
                      onChange={(e) => handleFormChange('i_rep_name', e.target.value)}
                      placeholder="예: 김재을"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_rep_id')}</label>
                    <input 
                      type="text" 
                      value={formData.i_rep_id}
                      onChange={(e) => handleFormChange('i_rep_id', formatRegNo(e.target.value))}
                      placeholder="예: 650101-1000000"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_rep_gender')}</label>
                    <select 
                      value={formData.i_rep_gender}
                      onChange={(e) => handleFormChange('i_rep_gender', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold cursor-pointer appearance-none"
                    >
                      <option value="M" className="bg-[#121217] text-white">{currentLang === 'kr' ? '남성' : currentLang === 'en' ? 'Male' : currentLang === 'ne' ? 'पुरुष' : 'Nam'}</option>
                      <option value="F" className="bg-[#121217] text-white">{currentLang === 'kr' ? '여성' : currentLang === 'en' ? 'Female' : currentLang === 'ne' ? 'महिला' : 'Nữ'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_caddr')}</label>
                    <input 
                      type="text" 
                      value={formData.i_caddr}
                      onChange={(e) => handleFormChange('i_caddr', e.target.value)}
                      placeholder="예: 전라남도 영암군 삼호읍 대불로 93"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_cphone')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_cphone}
                      onChange={(e) => handleFormChange('i_cphone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 061-460-2114"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Scheduled workplace info (근무처 변경 신고용) */}
              {isNewWorkplaceNeeded && (
                <div className="glass !border-amber-500/30 bg-amber-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg step-container-transition">
                  <span className="block text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-4">{t('s4_sub2')}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_new_cname')}</label>
                      <input 
                        type="text" 
                        value={formData.i_new_cname}
                        onChange={(e) => handleFormChange('i_new_cname', e.target.value)}
                        placeholder={currentLang === 'kr' ? '예: 지원ENG' : currentLang === 'en' ? 'e.g. Jiwon ENG' : currentLang === 'ne' ? 'जस्तै: Jiwon ENG' : 'Ví dụ: Jiwon ENG'}
                        className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_new_cregno')}</label>
                      <input 
                        type="text" 
                        value={formData.i_new_cregno}
                        onChange={(e) => handleFormChange('i_new_cregno', formatBusinessNo(e.target.value))}
                        placeholder={currentLang === 'kr' ? '예: XXX-XX-XXXXX' : currentLang === 'en' ? 'e.g. XXX-XX-XXXXX' : currentLang === 'ne' ? 'जस्तै: XXX-XX-XXXXX' : 'Ví dụ: XXX-XX-XXXXX'}
                        className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{t('l_new_cphone')}</label>
                      <input 
                        type="tel" 
                        value={formData.i_new_cphone}
                        onChange={(e) => handleFormChange('i_new_cphone', formatPhoneNumber(e.target.value))}
                        placeholder={currentLang === 'kr' ? '예: XXX-XXX-XXXX' : currentLang === 'en' ? 'e.g. XXX-XXX-XXXX' : currentLang === 'ne' ? 'जस्तै: XXX-XXX-XXXX' : 'Ví dụ: XXX-XXX-XXXX'}
                        className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Accommodation section for extension / registry */}
              {isDormNeeded && (
                <div className={`glass !border-emerald-500/30 bg-emerald-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg step-container-transition transition-all ${activePickerSection === 'dorm' ? 'relative z-[100]' : 'relative z-10'}`}>
                  <span className="block text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-4">{t('s4_sub3')}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t('l_dorm_own')}</label>
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                        {(['own_self', 'own_rent', 'own_other'] as const).map((own) => (
                          <label key={own} className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-350">
                            <input 
                              type="radio" 
                              name="r_own" 
                              value={own} 
                              checked={formData.r_own === own}
                              onChange={(e) => handleFormChange('r_own', e.target.value)}
                              className="w-4.5 h-4.5 text-emerald-500 border-white/20 bg-black/40"
                            />
                            <span>{own === 'own_self' ? t('own_1') : own === 'own_rent' ? t('own_2') : t('own_3')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t('l_dorm_type')}</label>
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                        {(['type_dorm', 'type_private', 'type_hotel'] as const).map((ht) => (
                          <label key={ht} className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-350">
                            <input 
                              type="radio" 
                              name="r_type" 
                              value={ht} 
                              checked={formData.r_type === ht}
                              onChange={(e) => handleFormChange('r_type', e.target.value)}
                              className="w-4.5 h-4.5 text-emerald-500 border-white/20 bg-black/40"
                            />
                            <span>{ht === 'type_dorm' ? t('type_1') : ht === 'type_private' ? t('type_2') : t('type_3')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <DatePicker 
                      label={t('l_dorm_start')}
                      value={formData.i_dorm_start}
                      onChange={(val) => handleFormChange('i_dorm_start', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_dorm_start')}
                      className="sm:col-span-2 max-w-[200px]"
                      openUpward
                      onOpenChange={(open) => setActivePickerSection(open ? 'dorm' : null)}
                    />
                  </div>
                </div>
              )}

              {/* Remaining variables inside section */}
              <div className={`glass !border-indigo-500/30 bg-indigo-500/[0.02] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20 transition-all ${activePickerSection === 'guar' ? 'relative z-[100]' : 'relative z-10'}`}>
                <span className="block text-xs font-extrabold text-indigo-400 tracking-widest uppercase mb-4">{t('s4_sub4')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job and KSCO Standard Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-400 leading-none uppercase tracking-wider">{t('l_job')}</label>
                      <select
                        onChange={(e) => {
                          const item = SHIPYARD_JOB_CODES.find(j => j.code === e.target.value);
                          if (item) {
                            handleFormChange('i_job', item.titleKr);
                            handleFormChange('i_job_code', item.code);
                          }
                        }}
                        className="bg-black/50 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-lg px-2 py-0.5"
                      >
                        <option value="">표준직종 선택</option>
                        {SHIPYARD_JOB_CODES.map(j => (
                          <option key={j.code} value={j.code} className="bg-[#121217] text-white">
                            {j.titleKr} ({j.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      value={formData.i_job}
                      onChange={(e) => handleFormChange('i_job', e.target.value)}
                      placeholder="예: 조선용접공"
                      className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    {formData.i_job_code && (
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold mt-1 block">
                        한국표준직업분류 (KSCO): {formData.i_job_code}
                      </span>
                    )}
                  </div>

                  {/* Annual Income */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-bold leading-none uppercase tracking-wider ${errorHighlights.has('i_income') ? 'text-rose-500' : 'text-slate-400'}`}>{t('l_income')}</label>
                      {formData.i_income && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          = {Number(formData.i_income.replace(/,/g, '') || 0) * 10000 > 0 ? (Number(formData.i_income.replace(/,/g, '') || 0) * 10000).toLocaleString() : 0} 원
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.i_income}
                        onChange={(e) => handleFormChange('i_income', formatMoney(e.target.value))}
                        placeholder="3,600"
                        className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-4 pr-20 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono text-right font-bold ${
                          errorHighlights.has('i_income') ? 'error-highlight' : ''
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-white/40">{currentLang === 'kr' ? '만원' : currentLang === 'en' ? '10k KRW' : currentLang === 'ne' ? '१० हजार वोन' : 'Vạn Won'}</span>
                    </div>
                    <span className="text-[10px] text-slate-450 mt-1 block">
                      * 소득금액증명원 또는 근로소득원천징수영수증 상의 연간 총급여액
                    </span>
                  </div>

                  {isReentryPeriodNeeded && (
                    <div className="sm:col-span-2 step-container-transition">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('l_reentry')}</label>
                      <input 
                        type="text" 
                        value={formData.i_reentry_period}
                        onChange={(e) => handleFormChange('i_reentry_period', e.target.value)}
                        placeholder="예: 1년"
                        className="w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {isRefundAccountNeeded && (
                    <div className="sm:col-span-2 step-container-transition">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('l_refund')}</label>
                      <div className="flex border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500">
                        <input 
                          type="text" 
                          value={formData.i_refund_bank}
                          onChange={(e) => handleFormChange('i_refund_bank', e.target.value)}
                          placeholder="은행명 (예: 신한은행)"
                          className="w-1/3 px-4 py-3 text-sm focus:outline-none bg-black/40 text-white placeholder-slate-500 border-r border-white/10 font-semibold"
                        />
                        <input 
                          type="text" 
                          value={formData.i_refund_acc}
                          onChange={(e) => handleFormChange('i_refund_acc', e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="계좌번호 (하이픈 없이)"
                          className="w-2/3 px-4 py-3 text-sm focus:outline-none bg-transparent text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {isGuaranteeNeeded && (
                    <div className="sm:col-span-2 step-container-transition">
                      <div className="grid grid-cols-2 gap-2">
                        <DatePicker 
                          label={t('l_guar_start')}
                          value={formData.i_guar_start}
                          onChange={(val) => handleFormChange('i_guar_start', val)}
                          placeholder="YYYY-MM-DD"
                          error={errorHighlights.has('i_guar_start')}
                          openUpward
                          onOpenChange={(open) => setActivePickerSection(open ? 'guar' : null)}
                        />
                        <DatePicker 
                          label={t('l_guar_end')}
                          value={formData.i_guar_end}
                          onChange={(val) => handleFormChange('i_guar_end', val)}
                          placeholder="YYYY-MM-DD"
                          error={errorHighlights.has('i_guar_end')}
                          alignRight
                          openUpward
                          onOpenChange={(open) => setActivePickerSection(open ? 'guar' : null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(3)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition cursor-pointer min-h-[48px] text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={() => handleNextStep(5)}
                  className="w-2/3 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-extrabold rounded-xl transition shadow-[0_0_25px_rgba(99,102,241,0.4)] cursor-pointer flex items-center justify-center gap-2 min-h-[48px] text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  <span>{t('btn_to_ai')}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI Document Crosscheck Verification */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s5_step')}</span>
                  <span className="inline sm:hidden">05</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s5_title')}</h3>
              </div>

              {/* Upload Drop Zone for Cross Check */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropVerificationDocs}
                className="bg-gradient-to-br from-slate-950 to-indigo-950/50 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden text-center border-2 border-indigo-500/20 border-dashed"
              >
                <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-extrabold mb-1">{t('s5_sub1')}</h4>
                <p className="text-xs text-indigo-200 max-w-md mx-auto mb-6">{t('s5_desc')}</p>

                {/* Styled Drag & Drop Buttons */}
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
                  <label className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-5 cursor-pointer transition">
                    <Camera className="w-6 h-6 text-indigo-300 mb-1" />
                    <span className="text-xs font-bold text-slate-200">{t('s5_btn_camera')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const base64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
                          reader.readAsDataURL(file);
                        });
                        setAttachments(prev => [...prev, { id: Math.random().toString(), name: file.name, base64, mimeType: file.type }]);
                        e.target.value = '';
                      }}
                      className="hidden" 
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-5 cursor-pointer transition">
                    <Upload className="w-6 h-6 text-indigo-300 mb-1" />
                    <span className="text-xs font-bold text-slate-200">{t('s5_btn_gallery')}</span>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*, application/pdf"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files) return;
                        for (let i = 0; i < files.length; i++) {
                           const file = files[i];
                           const base64 = await new Promise<string>((resolve) => {
                             const reader = new FileReader();
                             reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
                             reader.readAsDataURL(file);
                           });
                           setAttachments(prev => [...prev, { id: Math.random().toString(), name: file.name, base64, mimeType: file.type }]);
                        }
                        e.target.value = '';
                      }}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Uploaded File Items */}
                {attachments.length > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        <span>
                          {currentLang === 'kr' 
                            ? `업로드 완료된 검증 서류 (${attachments.length}개)` 
                            : currentLang === 'en' 
                            ? `Uploaded Verification Docs (${attachments.length})` 
                            : currentLang === 'ne'
                            ? `अपलोड गरिएका प्रमाणीकरण कागजातहरू (${attachments.length})`
                            : `Tài liệu xác minh đã tải lên (${attachments.length})`}
                        </span>
                      </span>
                      <button 
                        onClick={() => setAttachments([])}
                        className="text-[10px] text-rose-300 hover:text-rose-450 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-md transition"
                      >
                        {currentLang === 'kr' ? '전체 지우기' : currentLang === 'en' ? 'Clear All' : currentLang === 'ne' ? 'सबै हटाउनुहोस्' : 'Xóa tất cả'}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      {attachments.map((doc, index) => (
                        <div key={doc.id} className="relative group bg-white/10 border border-white/15 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs text-white max-w-[140px] truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate pr-4 font-semibold">{doc.name}</span>
                          <button 
                            onClick={() => setAttachments(prev => prev.filter(a => a.id !== doc.id))}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition shadow hover:bg-rose-600"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI results Panel */}
              {isVerifyProcessing && (
                <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col items-center justify-center text-center py-10">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                  <span className="text-sm font-extrabold text-indigo-200 animate-pulse">{t('ai_loading')}</span>
                </div>
              )}

              {/* Verify Passed Card */}
              {!isVerifyProcessing && verificationPassed === true && (
                <div className="bg-emerald-950/20 text-emerald-100 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-black/20 flex gap-4 step-container-transition">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-base text-emerald-300 mb-1">{t('ai_pass_title')}</h4>
                    <p className="text-xs text-emerald-400/90 font-semibold leading-relaxed">{t('ai_pass_desc')}</p>
                  </div>
                </div>
              )}

              {/* Verify Mismatch Card */}
              {!isVerifyProcessing && verificationPassed === false && issues.length > 0 && (
                <div className="bg-rose-950/20 text-rose-100 border border-rose-500/20 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col gap-3 step-container-transition">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-10 h-10 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-base text-rose-300 mb-1">{t('ai_fail_title')} ({issues.length}건)</h4>
                      <p className="text-xs text-rose-400/90 font-semibold">{t('ai_msg_fail_desc')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 mt-2">
                    {issues.map((iss, idx) => (
                      <div key={idx} className="bg-black/30 p-3 rounded-xl border border-rose-500/10 shadow-sm">
                        <span className="inline-block px-2.5 py-0.5 bg-rose-550/20 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-extrabold rounded-md mb-1.5">{iss.category}</span>
                        <div className="font-extrabold text-sm text-white mb-1 leading-snug">{iss.description}</div>
                        <div className="text-xs text-rose-400 font-bold">{iss.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action operations and buttons */}
              <div className="flex flex-col gap-2.5 sm:gap-3 pt-4">
                <button 
                  onClick={handleVerify}
                  disabled={isVerifyProcessing}
                  className="w-full py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all text-sm sm:text-base flex justify-center items-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t('btn_verify')}</span>
                </button>

                <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-3 mt-1">
                  <button 
                    onClick={() => handlePrevStep(4)} 
                    className="col-span-1 sm:w-1/4 py-3 sm:py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition text-xs sm:text-sm cursor-pointer min-h-[44px]"
                  >
                    {t('btn_prev')}
                  </button>
                  <button 
                    onClick={() => handlePrevStep(2)} // focus right to inputs
                    className="col-span-1 sm:w-1/4 py-3 sm:py-3.5 bg-rose-950/20 border border-rose-500/20 hover:bg-rose-900/30 active:bg-rose-900/40 text-rose-300 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('btn_edit')}</span>
                  </button>
                  <button 
                    onClick={() => handleNextStep(6)}
                    className="col-span-1 sm:w-2/4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm min-h-[44px]"
                  >
                    <span>{t('btn_next')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PDF Generation download list page */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s6_step')}</span>
                  <span className="inline sm:hidden">06</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s6_title')}</h3>
                <p className="text-sm text-slate-450 mt-1 font-medium">{t('s6_desc')}</p>
              </div>

              {/* Checks */}
              <div className="glass p-5 rounded-3xl shadow-lg border border-white/10 space-y-3">
                <span className="block text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-1">{t('s6_sub1')}</span>
                <div className="space-y-2.5">
                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition has-[:checked]:bg-blue-950/20 has-[:checked]:border-blue-500">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.main}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, main: e.target.checked }))}
                      className="w-5 h-5 text-blue-500 border-white/20 rounded mr-3 bg-black/40 cursor-pointer" 
                    />
                    <span className="font-extrabold text-slate-200 text-sm">{t('doc_1')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition has-[:checked]:bg-emerald-950/20 has-[:checked]:border-emerald-500">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.residence}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, residence: e.target.checked }))}
                      className="w-5 h-5 text-emerald-500 border-white/20 rounded mr-3 bg-black/40 cursor-pointer" 
                    />
                    <span className="font-extrabold text-slate-200 text-sm">{t('doc_2')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition has-[:checked]:bg-indigo-950/20 has-[:checked]:border-indigo-500">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.guarantee}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, guarantee: e.target.checked }))}
                      className="w-5 h-5 text-indigo-500 border-white/20 rounded mr-3 bg-black/40 cursor-pointer" 
                    />
                    <span className="font-extrabold text-slate-200 text-sm">{t('doc_3')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition has-[:checked]:bg-amber-950/20 has-[:checked]:border-amber-500">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.income}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, income: e.target.checked }))}
                      className="w-5 h-5 text-amber-500 border-white/20 rounded mr-3 bg-black/40 cursor-pointer" 
                    />
                    <span className="font-extrabold text-slate-200 text-sm">외국인 직업 및 연간 소득금액 신고서 (법정 서식)</span>
                  </label>

                  {/* Custom Registered Documents */}
                  {customDocList.map(cDoc => (
                    <div 
                      key={cDoc.id}
                      className="p-3 sm:p-3.5 border border-white/10 rounded-2xl flex flex-col xs:flex-row xs:items-center justify-between hover:bg-white/5 transition has-[:checked]:bg-purple-950/20 has-[:checked]:border-purple-500/50 gap-2"
                    >
                      <label className="flex items-center flex-1 cursor-pointer min-w-0">
                        <input 
                          type="checkbox" 
                          checked={!!selectedDocs[cDoc.id]}
                          onChange={(e) => setSelectedDocs(prev => ({ ...prev, [cDoc.id]: e.target.checked }))}
                          className="w-5 h-5 text-purple-500 border-white/20 rounded mr-3 bg-black/40 cursor-pointer shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-200 text-sm truncate">{cDoc.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shrink-0">
                              추가 서류
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{cDoc.desc}</p>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setDebugModalDocType(cDoc.id);
                          setIsDebugModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 self-end xs:self-auto min-h-[36px]"
                        title="이 서류의 좌표 편집기 열기"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                        <span>좌표 편집</span>
                      </button>
                    </div>
                  ))}

                  {/* Button to register new document directly from Step 6 */}
                  <button
                    type="button"
                    onClick={() => {
                      setDebugModalDocType('income');
                      setIsDebugModalOpen(true);
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-dashed border-white/15 hover:border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ 신규 서류 등록 및 실시간 좌표 설정</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar: Company Doc Request & PDF Generation */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenCompanyDocRequest()}
                  className="flex-1 py-3.5 sm:py-4 bg-white/5 hover:bg-emerald-950/30 text-emerald-300 hover:text-emerald-200 active:bg-emerald-900/40 font-extrabold rounded-2xl border border-white/10 hover:border-emerald-500/40 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm shadow-sm min-h-[48px]"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>회사 준비 서류 발급 요청서</span>
                </button>
                <button 
                  type="button"
                  onClick={generateSelectedPDFs}
                  className="flex-1 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20 text-xs sm:text-sm min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{t('btn_generate')}</span>
                </button>
              </div>

              {/* Downloads list */}
              {downloadLinks.length > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">
                      생성 완료된 출입국 법정 서식 ({downloadLinks.length}건)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPdfPreview(downloadLinks[0].url, downloadLinks[0].name, downloadLinks[0].filename)}
                      className="px-2.5 py-1.5 bg-blue-600/25 hover:bg-blue-600/40 active:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm self-start xs:self-auto min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>첫 번째 서류 즉시 미리보기</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {downloadLinks.map((link, idx) => (
                      <div 
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-black/40 hover:bg-black/60 border border-emerald-500/20 rounded-xl transition duration-200 shadow-sm gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-extrabold text-white block truncate">{link.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono block truncate">{link.filename}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-stretch xs:self-auto justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenPdfPreview(link.url, link.name, link.filename)}
                            className="flex-1 xs:flex-initial text-xs font-bold text-blue-300 hover:text-white flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-2 sm:py-1.5 rounded-lg transition cursor-pointer shadow-sm min-h-[36px]"
                            title="서식 내용 화면 미리보기"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>미리보기</span>
                          </button>

                          <a 
                            href={link.url}
                            download={link.filename}
                            className="flex-1 xs:flex-initial text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 px-3 py-2 sm:py-1.5 rounded-lg transition cursor-pointer shadow-sm min-h-[36px]"
                            title="PDF 파일 다운로드"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>다운로드</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation button */}
              <div className="pt-2 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(5)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-2xl transition cursor-pointer text-xs sm:text-sm min-h-[48px]"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={() => {
                    setCheckedRequiredDocs({});
                    handleNextStep(7);
                  }}
                  className="w-2/3 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20 min-h-[48px]"
                >
                  <span>{t('btn_to_step7')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: Final checklist validation */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 relative">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-[0.2em] uppercase">
                  <span className="hidden sm:inline">{t('s7_step')}</span>
                  <span className="inline sm:hidden">07</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">{t('s7_title')}</h3>
                <p className="text-sm text-slate-450 mt-1 font-medium">{t('s7_desc')}</p>
              </div>

              {/* Checklist items dynamic mapping */}
              <div className="glass p-5 rounded-3xl shadow-lg border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <span className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
                    출입국 민원 필수 제출 서류 목록
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenCompanyDocRequest()}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>회사 준비 서류 일괄 발급 요청문 작성</span>
                  </button>
                </div>

                {(() => {
                  const docList = docMatrix[formData.visaType]?.[formData.reqType] || docMatrix[formData.visaType]?.['default'] || [];
                  
                  if (docList.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm text-slate-400">
                        선택된 민원에 대한 체크리스트가 존재하지 않습니다.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {(docList || []).map((doc, idx) => {
                        const docName = doc.name[currentLang] || doc.name.kr;
                        const isDocChecked = !!checkedRequiredDocs[idx];

                        let badgeColor = '';
                        let badgeLabel = '';
                        if (doc.type === 'auto') {
                          badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                          badgeLabel = t('badge_auto');
                        } else if (doc.type === 'company') {
                          badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                          badgeLabel = t('badge_company');
                        } else {
                          badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                          badgeLabel = t('badge_personal');
                        }

                        return (
                          <label 
                            key={idx}
                            className={`flex items-start sm:items-center p-4 border rounded-2xl cursor-pointer transition shadow-sm ${
                              isDocChecked 
                              ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isDocChecked}
                              onChange={(e) => {
                                setCheckedRequiredDocs(prev => ({
                                  ...prev,
                                  [idx]: e.target.checked
                                }));
                              }}
                              className="w-5 h-5 text-emerald-500 rounded border-white/20 mr-4 bg-black/40 cursor-pointer self-start sm:self-center mt-0.5 sm:mt-0"
                            />
                            <div className="flex flex-col xs:flex-row xs:items-center w-full justify-between gap-2 min-w-0">
                              <span className="font-bold text-slate-200 text-xs sm:text-sm leading-snug break-keep pr-1">
                                {docName}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-auto">
                                <span className={`text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg font-bold whitespace-nowrap shadow-sm border shrink-0 ${badgeColor}`}>
                                  {badgeLabel}
                                </span>
                                {doc.type === 'company' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleOpenCompanyDocRequest([doc.name.kr]);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 active:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-sm min-h-[32px]"
                                    title="회사 사장 또는 총무과에 이 서류 발급 요청문 작성"
                                  >
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>발급 요청문</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Final success display */}
              {(() => {
                const docList = docMatrix[formData.visaType]?.[formData.reqType] || docMatrix[formData.visaType]?.['default'] || [];
                const allChecked = docList.length > 0 && docList.every((_, idx) => checkedRequiredDocs[idx]);
                
                if (!allChecked) return null;

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-950/20 border-2 border-emerald-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                    <h3 className="text-base sm:text-lg font-extrabold text-emerald-300 mb-1">
                      {t('s7_success_title')}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm text-emerald-400 leading-relaxed font-semibold transition animate-pulse" 
                      dangerouslySetInnerHTML={{ __html: t('s7_success_desc') }} 
                    />
                  </motion.div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => handlePrevStep(6)} 
                  className="w-1/3 py-3.5 sm:py-4 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 font-bold text-slate-350 rounded-xl transition cursor-pointer text-xs sm:text-sm min-h-[48px]"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  onClick={handleHomeClick}
                  className="w-2/3 py-3.5 sm:py-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold rounded-xl transition shadow-md border border-white/10 text-xs sm:text-sm cursor-pointer min-h-[48px]"
                >
                  {t('btn_home')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer credits */}
      <footer className="text-center py-6 text-xs font-bold text-slate-400 max-w-7xl mx-auto px-4 w-full">
        <span>Made by 동반성장부 &copy; {new Date().getFullYear()} HD HYUNDAI SAMHO HEAVY INDUSTRIES. ALL RIGHTS RESERVED.</span>
      </footer>

      {/* Embedded Modals / Popups */}
      <DocInfoModal 
        isOpen={isDocInfoOpen}
        onClose={() => setIsDocInfoOpen(false)}
        visaType={formData.visaType}
        reqType={activeDocInfoType}
        currentLang={currentLang}
        onRequestCompanyDoc={(docs) => handleOpenCompanyDocRequest(docs)}
      />

      <CompanyDocRequestModal
        isOpen={isCompanyDocModalOpen}
        onClose={() => setIsCompanyDocModalOpen(false)}
        formData={formData}
        targetDocNames={companyDocModalTargets}
        visaType={formData.visaType}
        reqType={formData.reqType}
      />

      <DBModal 
        isOpen={isDBModalOpen}
        onClose={() => setIsDBModalOpen(false)}
        onLoadItem={handleLoadItem}
        onDeleteItem={handleDeleteItem}
      />

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file) => processOCRFile(file)}
        currentLang={currentLang}
      />

      <WorkplaceModal
        isOpen={isWorkplaceModalOpen}
        onClose={() => {
          setIsWorkplaceModalOpen(false);
          // reload workplaces from storage
          try {
            const saved = localStorage.getItem('visaWorkplaces');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) setWorkplaces(parsed);
            }
          } catch(e) {}
        }}
        workplaces={workplaces || DEFAULT_WORKPLACES}
        selectedWorkplaceId={selectedWorkplaceId}
        onSelectWorkplace={(wp) => {
          handleSelectWorkplace(wp);
          setSelectedWorkplaceId(wp.id);
        }}
        onSaveWorkplaces={handleSaveWorkplaces}
        lang={currentLang}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={() => {
          handleResetData();
          showAlert('데이터 파기 완료', '모든 개인정보 및 로컬 캐시가 즉시 완전 파기되었습니다.', 'success');
        }}
      />

      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        lang={currentLang}
        onOpenDebugDoc={(docId) => {
          setDebugModalDocType(docId);
          setIsDebugModalOpen(true);
        }}
      />

      <PdfDebugModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        formData={formData}
        initialDocType={debugModalDocType}
        onUpdateCustomDocs={(docs) => setCustomDocList(docs)}
      />

      <PdfPreviewModal
        isOpen={previewPdfState.isOpen}
        onClose={() => setPreviewPdfState(prev => ({ ...prev, isOpen: false }))}
        pdfUrl={previewPdfState.url}
        title={previewPdfState.title}
        filename={previewPdfState.filename}
      />

      {/* Alert modal markup */}
      {msgDialog.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[220] flex items-center justify-center p-4">
          <div className="glass p-7 rounded-3xl w-full max-w-xs shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 text-center step-container-transition">
            <div className="mb-4">
              {msgDialog.type === 'success' ? (
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : msgDialog.type === 'error' ? (
                <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Info className="w-8 h-8" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">{msgDialog.title}</h3>
            <p className="text-xs text-slate-350 font-semibold mb-6 leading-relaxed whitespace-pre-wrap">{msgDialog.desc}</p>
            <button 
              onClick={closeAlert}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              확인 (OK)
            </button>
          </div>
        </div>
      )}

      {/* Confirm modal markup */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[220] flex items-center justify-center p-4">
          <div className="glass p-7 rounded-3xl w-full max-w-xs shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 text-center step-container-transition">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-350 font-semibold mb-6 leading-relaxed whitespace-pre-wrap">{confirmDialog.desc}</p>
            <div className="flex gap-2.5">
              <button 
                onClick={closeConfirm}
                className="w-1/2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-355 text-slate-300 rounded-xl font-bold transition text-xs cursor-pointer"
              >
                취소 (Cancel)
              </button>
              <button 
                onClick={handleConfirmOk}
                className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition text-xs shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
              >
                확인 (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
