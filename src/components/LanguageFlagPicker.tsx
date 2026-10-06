import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LangCode } from '../i18n';

interface LanguageFlagPickerProps {
  currentLang: LangCode;
  onSelectLang: (lang: LangCode) => void;
}

interface LangOption {
  code: LangCode;
  name: string;
  flag: string;
  country: string;
}

const LANGUAGES: LangOption[] = [
  { code: 'kr', name: '한국어', country: '대한민국', flag: '🇰🇷' },
  { code: 'en', name: 'English', country: 'United States', flag: '🇺🇸' },
  { code: 'vn', name: 'Tiếng Việt', country: 'Việt Nam', flag: '🇻🇳' },
  { code: 'ne', name: 'नेपाली', country: 'नेपाल', flag: '🇳🇵' }
];

export const LanguageFlagPicker: React.FC<LanguageFlagPickerProps> = ({
  currentLang,
  onSelectLang
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Compact Flag Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center justify-center transition cursor-pointer text-base shadow-sm relative group"
        title={`언어 및 국가 선택 (현재: ${activeOption.country} ${activeOption.flag})`}
      >
        <span className="text-lg leading-none select-none">{activeOption.flag}</span>
      </button>

      {/* Flag Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-[#141622] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
            국가 및 언어 선택
          </div>
          <div className="space-y-0.5">
            {LANGUAGES.map(item => {
              const isSelected = item.code === currentLang;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onSelectLang(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 text-white border border-blue-500/40 font-bold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none">{item.flag}</span>
                    <div>
                      <div className="text-xs font-bold leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-400 leading-none mt-0.5">{item.country}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
