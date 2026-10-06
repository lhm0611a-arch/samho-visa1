import React, { useState } from 'react';
import { Building2, Plus, Trash2, Check, X, ShieldCheck, Edit3 } from 'lucide-react';
import { WorkplaceProfile } from '../types';
import { LangCode } from '../i18n';

interface WorkplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workplaces?: WorkplaceProfile[];
  selectedWorkplaceId?: string;
  onSelectWorkplace?: (wp: WorkplaceProfile) => void;
  onSaveWorkplaces?: (wps: WorkplaceProfile[]) => void;
  lang?: LangCode;
}

export const WorkplaceModal: React.FC<WorkplaceModalProps> = ({
  isOpen,
  onClose,
  workplaces = [],
  selectedWorkplaceId = '',
  onSelectWorkplace = (_wp: WorkplaceProfile) => {},
  onSaveWorkplaces = (_wps: WorkplaceProfile[]) => {},
  lang = 'kr'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<WorkplaceProfile>({
    id: '',
    name: '',
    regNo: '',
    repName: '',
    repIdMasked: '',
    repGender: 'M',
    address: '전라남도 영암군 삼호읍 대불로 93',
    phone: '061-460-2114'
  });

  if (!isOpen) return null;

  const list = Array.isArray(workplaces) ? workplaces : [];

  const handleStartAdd = () => {
    setEditForm({
      id: `custom_${Date.now()}`,
      name: '',
      regNo: '',
      repName: '',
      repIdMasked: '700101-1******',
      repGender: 'M',
      address: '전라남도 영암군 삼호읍 대불로 93 ',
      phone: '061-460-'
    });
    setIsEditing(true);
  };

  const handleStartEdit = (wp: WorkplaceProfile) => {
    setEditForm({ ...wp });
    setIsEditing(true);
  };

  const handleSaveItem = () => {
    if (!editForm.name.trim()) return;
    const exists = list.find(w => w.id === editForm.id);
    let updated: WorkplaceProfile[];
    if (exists) {
      updated = list.map(w => w.id === editForm.id ? editForm : w);
    } else {
      updated = [...list, editForm];
    }
    onSaveWorkplaces(updated);
    setIsEditing(false);
  };

  const handleDeleteItem = (id: string) => {
    if (list.length <= 1) return;
    const updated = list.filter(w => w.id !== id);
    onSaveWorkplaces(updated);
    if (selectedWorkplaceId === id && updated.length > 0) {
      onSelectWorkplace(updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#171a26]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {lang === 'kr' ? '사업장 및 사내협력사 관리' : 'Workplace & Subcontractors'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate sm:whitespace-normal">
                {lang === 'kr' ? '신청서 및 신원보증서에 자동 기입될 사업장 프로필을 선택하거나 관리합니다.' : 'Select or manage workplace profiles for automatic document population.'}
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

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isEditing ? (
            <div className="bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs sm:text-sm font-bold text-blue-400">
                  {editForm.id.startsWith('custom_') ? '신규 사업장/협력사 등록' : '사업장 정보 수정'}
                </span>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  취소
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">사업장/회사 명칭 *</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="예: (주)삼호선박기술"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">사업자등록번호 (10자리) *</label>
                  <input 
                    type="text" 
                    value={editForm.regNo}
                    onChange={(e) => setEditForm({...editForm, regNo: e.target.value})}
                    placeholder="예: 411-86-12345"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">대표자 성명 *</label>
                  <input 
                    type="text" 
                    value={editForm.repName}
                    onChange={(e) => setEditForm({...editForm, repName: e.target.value})}
                    placeholder="예: 홍길동"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">대표자 식별번호 (마스킹 권장)</label>
                  <input 
                    type="text" 
                    value={editForm.repIdMasked}
                    onChange={(e) => setEditForm({...editForm, repIdMasked: e.target.value})}
                    placeholder="예: 700101-1******"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">사업장 주소 *</label>
                  <input 
                    type="text" 
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="예: 전라남도 영암군 삼호읍 대불로 93"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">전화번호 *</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="예: 061-460-2114"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">대표자 성별</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({...editForm, repGender: 'M'})}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${editForm.repGender === 'M' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                      남성 (M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({...editForm, repGender: 'F'})}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${editForm.repGender === 'F' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                      여성 (F)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  저장하기
                </button>
              </div>
            </div>
          ) : null}

          {/* List of Workplaces */}
          <div className="space-y-2.5">
            {list.map((wp) => {
              const isSelected = wp.id === selectedWorkplaceId;
              return (
                <div 
                  key={wp.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition flex items-start justify-between gap-2.5 sm:gap-3 ${
                    isSelected 
                      ? 'bg-blue-950/30 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => onSelectWorkplace(wp)}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white break-keep">{wp.name}</h4>
                      {wp.isDefault && (
                        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">
                          원청/대표사
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5 shrink-0">
                          <Check className="w-3 h-3" /> 적용 중
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] sm:text-xs text-slate-400">
                      <div>사업자번호: <span className="text-slate-200 font-mono">{wp.regNo}</span></div>
                      <div>대표자: <span className="text-slate-200">{wp.repName}</span> ({wp.repIdMasked})</div>
                      <div className="sm:col-span-2 text-slate-300 break-keep">주소: {wp.address}</div>
                      <div>전화: <span className="text-slate-200 font-mono">{wp.phone}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleStartEdit(wp)}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                      title="수정"
                    >
                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {!wp.isDefault && (
                      <button
                        onClick={() => handleDeleteItem(wp.id)}
                        className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isEditing && (
            <button
              onClick={handleStartAdd}
              className="w-full py-2.5 sm:py-3 rounded-xl border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-950/20 text-slate-300 hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>신규 협력사 / 사업장 프로필 추가</span>
            </button>
          )}

          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-[11px] sm:text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-400" />
            <span className="break-keep">개인정보보호: 대표자 주민등록번호는 보안을 위해 마스킹 처리(생년월일 및 1******)된 형태로 안전하게 취급됩니다.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-[#171a26] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20 text-center"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
