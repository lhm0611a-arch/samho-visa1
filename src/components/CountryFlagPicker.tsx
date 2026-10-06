import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, ChevronDown, Check, X } from 'lucide-react';

export interface CountryItem {
  code: string;
  nameKr: string;
  nameEn: string;
  flag: string;
  officialImmiName: string;
  region: '동남아시아' | '서남/중앙아시아' | '동아시아/기타';
}

export const IMMIGRATION_COUNTRIES: CountryItem[] = [
  // 동남아시아 (주요 송출국)
  { code: 'VN', nameKr: '베트남', nameEn: 'Vietnam', flag: '🇻🇳', officialImmiName: 'VIETNAM', region: '동남아시아' },
  { code: 'ID', nameKr: '인도네시아', nameEn: 'Indonesia', flag: '🇮🇩', officialImmiName: 'INDONESIA', region: '동남아시아' },
  { code: 'KH', nameKr: '캄보디아', nameEn: 'Cambodia', flag: '🇰🇭', officialImmiName: 'CAMBODIA', region: '동남아시아' },
  { code: 'PH', nameKr: '필리핀', nameEn: 'Philippines', flag: '🇵🇭', officialImmiName: 'PHILIPPINES', region: '동남아시아' },
  { code: 'TH', nameKr: '태국', nameEn: 'Thailand', flag: '🇹🇭', officialImmiName: 'THAILAND', region: '동남아시아' },
  { code: 'MM', nameKr: '미얀마', nameEn: 'Myanmar', flag: '🇲🇲', officialImmiName: 'MYANMAR', region: '동남아시아' },
  { code: 'LA', nameKr: '라오스', nameEn: 'Laos', flag: '🇱🇦', officialImmiName: 'LAOS', region: '동남아시아' },
  { code: 'MY', nameKr: '말레이시아', nameEn: 'Malaysia', flag: '🇲🇾', officialImmiName: 'MALAYSIA', region: '동남아시아' },

  // 서남아시아 / 중앙아시아
  { code: 'NP', nameKr: '네팔', nameEn: 'Nepal', flag: '🇳🇵', officialImmiName: 'NEPAL', region: '서남/중앙아시아' },
  { code: 'UZ', nameKr: '우즈베키스탄', nameEn: 'Uzbekistan', flag: '🇺🇿', officialImmiName: 'UZBEKISTAN', region: '서남/중앙아시아' },
  { code: 'LK', nameKr: '스리랑카', nameEn: 'Sri Lanka', flag: '🇱🇰', officialImmiName: 'SRI LANKA', region: '서남/중앙아시아' },
  { code: 'BD', nameKr: '방글라데시', nameEn: 'Bangladesh', flag: '🇧🇩', officialImmiName: 'BANGLADESH', region: '서남/중앙아시아' },
  { code: 'KZ', nameKr: '카자흐스탄', nameEn: 'Kazakhstan', flag: '🇰🇿', officialImmiName: 'KAZAKHSTAN', region: '서남/중앙아시아' },
  { code: 'KG', nameKr: '키르기스스탄', nameEn: 'Kyrgyzstan', flag: '🇰🇬', officialImmiName: 'KYRGYZSTAN', region: '서남/중앙아시아' },
  { code: 'TJ', nameKr: '타지키스탄', nameEn: 'Tajikistan', flag: '🇹🇯', officialImmiName: 'TAJIKISTAN', region: '서남/중앙아시아' },
  { code: 'PK', nameKr: '파키스탄', nameEn: 'Pakistan', flag: '🇵🇰', officialImmiName: 'PAKISTAN', region: '서남/중앙아시아' },
  { code: 'IN', nameKr: '인도', nameEn: 'India', flag: '🇮🇳', officialImmiName: 'INDIA', region: '서남/중앙아시아' },

  // 동아시아 / 기타
  { code: 'MN', nameKr: '몽골', nameEn: 'Mongolia', flag: '🇲🇳', officialImmiName: 'MONGOLIA', region: '동아시아/기타' },
  { code: 'CN', nameKr: '중국', nameEn: 'China', flag: '🇨🇳', officialImmiName: 'CHINA', region: '동아시아/기타' },
  { code: 'KR', nameKr: '대한민국', nameEn: 'Korea', flag: '🇰🇷', officialImmiName: 'KOREA', region: '동아시아/기타' },
  { code: 'RU', nameKr: '러시아', nameEn: 'Russia', flag: '🇷🇺', officialImmiName: 'RUSSIA', region: '동아시아/기타' },
  { code: 'US', nameKr: '미국', nameEn: 'USA', flag: '🇺🇸', officialImmiName: 'USA', region: '동아시아/기타' },
  { code: 'JP', nameKr: '일본', nameEn: 'Japan', flag: '🇯🇵', officialImmiName: 'JAPAN', region: '동아시아/기타' }
];

export function findCountry(val: string): CountryItem | undefined {
  if (!val) return undefined;
  const clean = val.trim().toUpperCase();
  return IMMIGRATION_COUNTRIES.find(c => 
    c.officialImmiName === clean || 
    c.nameKr === val.trim() || 
    c.nameEn.toUpperCase() === clean || 
    c.code === clean
  );
}

interface CountryFlagPickerProps {
  value: string;
  onChange: (officialName: string) => void;
  error?: boolean;
  label?: string;
  placeholder?: string;
}

export const CountryFlagPicker: React.FC<CountryFlagPickerProps> = ({
  value,
  onChange,
  error = false,
  label = '국적 (Nationality)',
  placeholder = '예: VIETNAM'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('전체');
  const containerRef = useRef<HTMLDivElement>(null);

  const matched = findCountry(value);

  // Close when clicking outside
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

  const filtered = IMMIGRATION_COUNTRIES.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || 
      c.nameKr.toLowerCase().includes(q) || 
      c.nameEn.toLowerCase().includes(q) || 
      c.officialImmiName.toLowerCase().includes(q) ||
      c.flag.includes(q);
    const matchesRegion = activeRegion === '전체' || c.region === activeRegion;
    return matchesSearch && matchesRegion;
  });

  const handleSelect = (c: CountryItem) => {
    onChange(c.officialImmiName);
    setIsOpen(false);
    setSearch('');
  };

  // Top 8 fast quick chips
  const quickPicks = IMMIGRATION_COUNTRIES.slice(0, 8);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className={`block text-xs font-bold leading-none uppercase tracking-wider ${error ? 'text-rose-500' : 'text-slate-400'}`}>
          {label}
        </label>
        <span className="text-[11px] text-slate-500 font-medium">국기 아이콘 클릭 시 국가 목록 표시</span>
      </div>

      {/* Main Input with Flag Trigger */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center gap-1.5 text-sm transition cursor-pointer z-10"
          title="국가 및 국기 선택"
        >
          <span className="text-lg leading-none">{matched ? matched.flag : '🌐'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className={`w-full bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-16 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold ${
            error ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : ''
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            title="초기화"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Flag Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <span className="text-[10px] text-slate-500 font-bold shrink-0">빠른선택:</span>
        {quickPicks.map(c => {
          const isSelected = matched?.officialImmiName === c.officialImmiName;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => handleSelect(c)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title={`${c.nameKr} (${c.nameEn})`}
            >
              <span className="text-sm leading-none">{c.flag}</span>
              <span className="text-[11px]">{c.nameKr}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Flag Selector Modal / Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#13151f] border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-3.5 space-y-3 backdrop-blur-xl">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="국가명(한글, 영문, 국기) 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 text-[11px]">
            {['전체', '동남아시아', '서남/중앙아시아', '동아시아/기타'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRegion(r)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeRegion === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Country Flag Grid */}
          <div className="max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-0.5">
            {filtered.length > 0 ? (
              filtered.map(c => {
                const isSelected = matched?.officialImmiName === c.officialImmiName;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`p-2 rounded-xl text-left transition flex items-center justify-between gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0 leading-none">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{c.nameKr}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{c.officialImmiName}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-slate-500">
                일치하는 국가가 없습니다. 위 입력창에 영문으로 직접 입력하실 수 있습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
