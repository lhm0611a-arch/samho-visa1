import { FormData, WorkplaceProfile, JobCodeItem } from '../types';

export const DEFAULT_WORKPLACES: WorkplaceProfile[] = [
  {
    id: "hdsamho",
    name: "에이치디현대삼호 주식회사",
    regNo: "411-81-19799",
    repName: "김재을",
    repIdMasked: "650101-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93",
    phone: "061-460-2114",
    isDefault: true
  },
  {
    id: "gayoung_tech",
    name: "유한회사 가영테크",
    regNo: "847-81-03268",
    repName: "김삼춘",
    repIdMasked: "710403-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 (현대삼호중공업 內)",
    phone: "061-462-3588",
    isDefault: false
  },
  {
    id: "hd_career_sol",
    name: "현대커리어솔루션(주)",
    regNo: "411-86-99881",
    repName: "원종호",
    repIdMasked: "690319-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 (외업1관)",
    phone: "010-9709-2514",
    isDefault: false
  },
  {
    id: "sub_welding_1",
    name: "(주)삼호선박기술",
    regNo: "411-86-12345",
    repName: "이삼호",
    repIdMasked: "700315-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 사내공장 3B",
    phone: "061-460-5511",
    isDefault: false
  },
  {
    id: "sub_coating_2",
    name: "(주)현대도장플랜트",
    regNo: "411-87-67890",
    repName: "박도장",
    repIdMasked: "681120-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 도장공구",
    phone: "061-460-7722",
    isDefault: false
  },
  {
    id: "sub_pipe_3",
    name: "(주)대불해양엔지니어링",
    regNo: "411-88-24680",
    repName: "정해양",
    repIdMasked: "750805-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 의장1공구",
    phone: "061-460-8833",
    isDefault: false
  }
];

export const SHIPYARD_JOB_CODES: JobCodeItem[] = [
  { code: "7431", titleKr: "선박용접원 (선박/플랜트 블록 용접)", titleEn: "Welder (Shipbuilding/Plant)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7832", titleKr: "선박도장원 (선체/블록 방청 및 특수도장)", titleEn: "Painter (Hull/Block Coating)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7422", titleKr: "선박배관공 (선박 배관 및 기관실 배관)", titleEn: "Pipefitter (Marine Piping)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7411", titleKr: "선체취부원 / 철구조물 조립원", titleEn: "Ship Hull Fitter / Structure Assembler", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7621", titleKr: "전기원 (선박 전장 및 배선공)", titleEn: "Electrician (Marine Electrical)", category: "E-7-3 / E-9" },
  { code: "8520", titleKr: "선박 보수 및 기계 설치 보조원", titleEn: "Marine Mechanic / Assistant", category: "E-9" },
  { code: "9999", titleKr: "기타 제조업 단순노무원", titleEn: "General Manufacturing Worker", category: "E-9" }
];

export const initialFormData: FormData = {
  visaType: "E-7-4R",
  reqType: "chk_change_status",
  val_change_status: "E-7-4R (지역특화 숙련기능)",
  submitter: "self",
  i_surname: "",
  i_givenname: "",
  i_dob: "",
  i_gender: "M",
  i_nation: "",
  i_arc: "",
  i_passport: "",
  i_pass_issue: "",
  i_pass_exp: "",
  i_spouse: "",
  i_spouse_dob: "",
  i_parents: "",
  i_child1_name: "",
  i_child1_dob: "",
  i_child2_name: "",
  i_child2_dob: "",
  i_education: "고등학교 졸업",
  i_marriage: "기혼",
  i_marriage_date: "",
  i_total_workers: "138",
  i_e74_workers: "13",
  i_work_period: "총 약 1년 7개월",
  i_address_kr: "",
  i_cellphone: "",
  i_phone: "",
  i_address_home: "",
  i_home_phone: "",
  i_email: "",
  i_cname: "유한회사 가영테크",
  i_cregno: "847-81-03268",
  i_rep_name: "김삼춘",
  i_rep_id: "710403-1******",
  i_rep_gender: "M",
  i_caddr: "전라남도 영암군 삼호읍 대불로 93 (현대삼호중공업 內)",
  i_cphone: "061-462-3588",
  i_new_cname: "",
  i_new_cregno: "",
  i_new_cphone: "",
  r_own: "own_rent",
  r_type: "type_dorm",
  i_dorm_start: "",
  i_job: "선박도장원",
  i_job_code: "7832",
  i_income: "3,240",
  i_reentry_period: "1년",
  i_refund_bank: "",
  i_refund_acc: "",
  i_guar_start: "",
  i_guar_end: ""
};

export const PDF_COORDS_MAIN = {
  chk_alien_reg: { type: 'check', x: 69, y: 696 }, 
  chk_reissue: { type: 'check', x: 67, y: 663 }, 
  chk_extension: { type: 'check', x: 68, y: 639 }, 
  chk_change_status: { type: 'check', x: 68, y: 616 },
  val_change_status: { type: 'text', x: 187, y: 611, w: 23, h: 9 }, 
  chk_grant_status: { type: 'check', x: 68, y: 580 }, 
  chk_extra_act: { type: 'check', x: 226, y: 697 }, 
  chk_change_work: { type: 'check', x: 228, y: 663 },
  chk_reentry: { type: 'check', x: 226, y: 639 }, 
  chk_change_residence: { type: 'check', x: 226, y: 616 },
  surname: { type: 'text', x: 128, y: 524, w: 137, h: 11 }, 
  givenname: { type: 'text', x: 269, y: 524, w: 159, h: 11 },
  dob_yyyy: { type: 'text', x: 147, y: 496, w: 80, h: 13 }, 
  dob_mm: { type: 'text', x: 228, y: 498, w: 38, h: 11 }, 
  dob_dd: { type: 'text', x: 268, y: 498, w: 39, h: 11 }, 
  gender_m: { type: 'check', x: 370, y: 516 }, 
  gender_f: { type: 'check', x: 369, y: 505 }, 
  nation: { type: 'text', x: 482, y: 476, w: 56, h: 46 },
  arc_1: { type: 'text', x: 187, y: 476, w: 19, h: 20 }, 
  arc_2: { type: 'text', x: 207, y: 476, w: 20, h: 20 }, 
  arc_3: { type: 'text', x: 228, y: 476, w: 19, h: 20 }, 
  arc_4: { type: 'text', x: 249, y: 476, w: 17, h: 20 }, 
  arc_5: { type: 'text', x: 269, y: 476, w: 19, h: 20 }, 
  arc_6: { type: 'text', x: 289, y: 476, w: 18, h: 20 }, 
  arc_7: { type: 'text', x: 308, y: 476, w: 17, h: 20 }, 
  arc_8: { type: 'text', x: 325, y: 476, w: 19, h: 20 }, 
  arc_9: { type: 'text', x: 343, y: 476, w: 16, h: 20 }, 
  arc_10: { type: 'text', x: 362, y: 476, w: 16, h: 20 }, 
  arc_11: { type: 'text', x: 378, y: 476, w: 17, h: 20 }, 
  arc_12: { type: 'text', x: 397, y: 476, w: 16, h: 20 }, 
  arc_13: { type: 'text', x: 414, y: 476, w: 16, h: 20 },
  passport: { type: 'text', x: 127, y: 454, w: 101, h: 21 }, 
  pass_issue: { type: 'text', x: 308, y: 454, w: 87, h: 21 }, 
  pass_exp: { type: 'text', x: 480, y: 455, w: 59, h: 21 },
  address_kr: { type: 'text', x: 127, y: 434, w: 412, h: 20 }, 
  phone: { type: 'text', x: 184, y: 419, w: 113, h: 13 }, 
  cellphone: { type: 'text', x: 417, y: 420, w: 121, h: 13 },
  address_home: { type: 'text', x: 185, y: 399, w: 231, h: 21 }, 
  home_phone: { type: 'text', x: 483, y: 398, w: 55, h: 21 },
  cname: { type: 'text', x: 208, y: 335, w: 53, h: 20 }, 
  cregno: { type: 'text', x: 355, y: 335, w: 59, h: 20 }, 
  cphone: { type: 'text', x: 482, y: 334, w: 57, h: 21 },
  new_cname: { type: 'text', x: 207, y: 313, w: 53, h: 21 }, 
  new_cregno: { type: 'text', x: 356, y: 313, w: 59, h: 20 }, 
  new_cphone: { type: 'text', x: 482, y: 313, w: 56, h: 21 },
  job: { type: 'text', x: 483, y: 299, w: 55, h: 15 }, 
  income: { type: 'text', x: 207, y: 299, w: 47, h: 14 }, 
  reentry_period: { type: 'text', x: 208, y: 287, w: 53, h: 13 }, 
  email: { type: 'text', x: 355, y: 286, w: 163, h: 13 }, 
  refund_acc: { type: 'text', x: 356, y: 266, w: 183, h: 19 },
  app_date: { type: 'text', x: 208, y: 252, w: 87, h: 13 }, 
  sign_main: { type: 'text', x: 436, y: 252, w: 101, h: 13 }, 
  sign_sub_1: { type: 'text', x: 99, y: 130, w: 64, h: 22 }, 
  sign_sub_2: { type: 'text', x: 274, y: 130, w: 57, h: 19 }, 
  sign_sub_3: { type: 'text', x: 449, y: 130, w: 40, h: 18 }
};

export const PDF_COORDS_RESIDENCE = {
  f_nation: { type: 'text', x: 167, y: 683, w: 84, h: 45 }, 
  f_arc: { type: 'text', x: 388, y: 683, w: 142, h: 45 },
  f_name: { type: 'text', x: 168, y: 656, w: 194, h: 25 }, 
  f_phone: { type: 'text', x: 429, y: 654, w: 103, h: 26 }, 
  f_addr: { type: 'text', x: 168, y: 629, w: 362, h: 25 },
  p_nation: { type: 'text', x: 167, y: 554, w: 73, h: 38 }, 
  p_id: { type: 'text', x: 378, y: 554, w: 153, h: 39 }, 
  p_name: { type: 'text', x: 168, y: 525, w: 207, h: 25 }, 
  p_phone: { type: 'text', x: 429, y: 525, w: 99, h: 25 },
  rel_family: { type: 'check', x: 182, y: 503 }, 
  rel_employer: { type: 'check', x: 271, y: 502 }, 
  rel_other: { type: 'check', x: 366, y: 502 }, 
  rel_other_desc: { type: 'text', x: 428, y: 509, w: 96, h: 13 },
  own_self: { type: 'check', x: 181, y: 468 }, 
  own_rent: { type: 'check', x: 273, y: 470 }, 
  own_other: { type: 'check', x: 380, y: 469 }, 
  own_other_desc: { type: 'text', x: 440, y: 468, w: 83, h: 14 },
  type_private: { type: 'check', x: 181, y: 441 }, 
  type_dorm: { type: 'check', x: 325, y: 441 }, 
  type_hotel: { type: 'check', x: 182, y: 413 }, 
  type_other: { type: 'check', x: 326, y: 412 }, 
  type_other_desc: { type: 'text', x: 388, y: 406, w: 131, h: 17 },
  start_y: { type: 'text', x: 169, y: 374, w: 45, h: 19 }, 
  start_m: { type: 'text', x: 254, y: 374, w: 37, h: 18 }, 
  start_d: { type: 'text', x: 342, y: 373, w: 36, h: 21 },
  sign_y: { type: 'text', x: 150, y: 313, w: 61, h: 17 }, 
  sign_m: { type: 'text', x: 250, y: 314, w: 23, h: 16 }, 
  sign_d: { type: 'text', x: 316, y: 314, w: 21, h: 14 },
  p_sign_name: { type: 'text', x: 261, y: 290, w: 69, h: 17 }, 
  p_company: { type: 'text', x: 263, y: 275, w: 68, h: 15 }
};

export const PDF_COORDS_GUARANTEE = {
  f_surname: { type: 'text', x: 131, y: 672, w: 127, h: 30 }, 
  f_givenname: { type: 'text', x: 274, y: 672, w: 134, h: 29 }, 
  f_hanja: { type: 'text', x: 434, y: 672, w: 97, h: 29 },
  f_dob: { type: 'text', x: 163, y: 640, w: 245, h: 29 }, 
  f_sex_m: { type: 'check', x: 465, y: 654 }, 
  f_sex_f: { type: 'check', x: 507, y: 654 },
  f_nation: { type: 'text', x: 149, y: 607, w: 258, h: 31 }, 
  f_pass: { type: 'text', x: 450, y: 607, w: 81, h: 31 },
  f_addr: { type: 'text', x: 181, y: 576, w: 226, h: 30 }, 
  f_phone: { type: 'text', x: 451, y: 577, w: 80, h: 28 }, 
  f_purpose: { type: 'text', x: 166, y: 546, w: 362, h: 27 },
  p_name: { type: 'text', x: 145, y: 474, w: 260, h: 27 }, 
  p_hanja: { type: 'text', x: 434, y: 473, w: 97, h: 28 }, 
  p_nation: { type: 'text', x: 147, y: 444, w: 258, h: 25 },
  p_sex_m: { type: 'check', x: 466, y: 457 }, 
  p_sex_f: { type: 'check', x: 508, y: 456 },
  p_dob: { type: 'text', x: 220, y: 413, w: 186, h: 29 }, 
  p_phone: { type: 'text', x: 450, y: 414, w: 79, h: 27 }, 
  p_addr: { type: 'text', x: 143, y: 381, w: 385, h: 30 },
  p_rel: { type: 'text', x: 199, y: 352, w: 330, h: 29 }, 
  p_company: { type: 'text', x: 153, y: 320, w: 253, h: 29 }, 
  p_job: { type: 'text', x: 436, y: 321, w: 93, h: 27 },
  p_caddr: { type: 'text', x: 178, y: 290, w: 228, h: 27 }, 
  p_note: { type: 'text', x: 437, y: 290, w: 93, h: 27 }, 
  p_period: { type: 'text', x: 338, y: 260, w: 189, h: 25 }, 
  sign_y: { type: 'text', x: 355, y: 96, w: 60, h: 13 }, 
  sign_m: { type: 'text', x: 429, y: 98, w: 34, h: 12 }, 
  sign_d: { type: 'text', x: 480, y: 97, w: 31, h: 13 }, 
  p_sign_name: { type: 'text', x: 356, y: 66, w: 124, h: 20 }
};

export interface PdfCoordBox {
  type: 'text' | 'check';
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export const PDF_COORDS_INCOME: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 675, w: 160, h: 20 },
  f_arc: { type: 'text', x: 385, y: 675, w: 150, h: 20 },
  f_nation: { type: 'text', x: 150, y: 645, w: 160, h: 20 },
  f_visa: { type: 'text', x: 385, y: 645, w: 150, h: 20 },
  f_sojourn_status: { type: 'text', x: 385, y: 645, w: 150, h: 20 },
  f_phone: { type: 'text', x: 150, y: 615, w: 160, h: 20 },
  f_email: { type: 'text', x: 385, y: 615, w: 150, h: 20 },
  c_name: { type: 'text', x: 150, y: 550, w: 160, h: 20 },
  c_regno: { type: 'text', x: 385, y: 550, w: 150, h: 20 },
  c_job: { type: 'text', x: 150, y: 518, w: 160, h: 20 },
  job_title: { type: 'text', x: 150, y: 518, w: 160, h: 20 },
  c_job_code: { type: 'text', x: 385, y: 518, w: 150, h: 20 },
  job_code: { type: 'text', x: 385, y: 518, w: 150, h: 20 },
  c_income_won: { type: 'text', x: 200, y: 460, w: 120, h: 20 },
  annual_income: { type: 'text', x: 200, y: 460, w: 120, h: 20 },
  c_income_bracket: { type: 'check', x: 180, y: 420 },
  income_tax_proof: { type: 'check', x: 180, y: 420 },
  sign_y: { type: 'text', x: 200, y: 220, w: 50, h: 15 },
  sign_m: { type: 'text', x: 290, y: 220, w: 30, h: 15 },
  sign_d: { type: 'text', x: 360, y: 220, w: 30, h: 15 },
  f_sign: { type: 'text', x: 420, y: 180, w: 120, h: 20 },
  declarant_name: { type: 'text', x: 420, y: 180, w: 120, h: 20 }
};

export const FORM_FIELD_LABELS: Record<string, Record<string, string>> = {
  main: {
    chk_alien_reg: '민원: 외국인등록 [V]',
    chk_reissue: '민원: 등록증 재발급 [V]',
    chk_extension: '민원: 체류기간 연장허가 [V]',
    chk_change_status: '민원: 체류자격 변경허가 [V]',
    val_change_status: '변경 체류자격 기재란',
    chk_grant_status: '민원: 체류자격 부여 [V]',
    chk_extra_act: '민원: 체류자격외 활동 [V]',
    chk_change_work: '민원: 근무처 변경·추가 [V]',
    chk_reentry: '민원: 재입국허가 [V]',
    chk_change_residence: '민원: 체류지 변경신고 [V]',
    surname: '영문 성 (Surname)',
    givenname: '영문 명 (Given Name)',
    dob_yyyy: '생년월일 (연도 4자리)',
    dob_mm: '생년월일 (월 2자리)',
    dob_dd: '생년월일 (일 2자리)',
    gender_m: '성별: 남성 [V]',
    gender_f: '성별: 여성 [V]',
    nation: '국적 (Nationality)',
    arc_1: '외국인등록번호 1자리',
    arc_2: '외국인등록번호 2자리',
    arc_3: '외국인등록번호 3자리',
    arc_4: '외국인등록번호 4자리',
    arc_5: '외국인등록번호 5자리',
    arc_6: '외국인등록번호 6자리',
    arc_7: '외국인등록번호 7자리',
    arc_8: '외국인등록번호 8자리',
    arc_9: '외국인등록번호 9자리',
    arc_10: '외국인등록번호 10자리',
    arc_11: '외국인등록번호 11자리',
    arc_12: '외국인등록번호 12자리',
    arc_13: '외국인등록번호 13자리',
    passport: '여권번호 (Passport No.)',
    pass_issue: '여권발급일 (Issue Date)',
    pass_exp: '여권만료일 (Expiry Date)',
    address_kr: '대한민국 내 체류지 주소',
    phone: '국내 일반 전화번호',
    cellphone: '국내 휴대전화번호',
    address_home: '본국 주소',
    home_phone: '본국 전화번호',
    cname: '원근무처 상호',
    cregno: '원근무처 사업자번호',
    cphone: '원근무처 전화번호',
    new_cname: '예정근무처 상호',
    new_cregno: '예정근무처 사업자번호',
    new_cphone: '예정근무처 전화번호',
    job: '직업',
    income: '연간 소득금액 (만원)',
    reentry_period: '재입국신청기간',
    email: '전자우편 주소 (E-mail)',
    refund_acc: '수수료 반환계좌 (은행/계좌)',
    app_date: '신청일자 (YYYY.MM.DD)',
    sign_main: '신청인 서명란',
    sign_sub_1: '제출자 구분 (본인)',
    sign_sub_2: '제출자 구분 (배우자)',
    sign_sub_3: '제출자 구분 (부모)'
  },
  residence: {
    f_nation: '외국인 국적',
    f_arc: '외국인등록번호',
    f_name: '외국인 성명',
    f_phone: '외국인 전화번호',
    f_addr: '제공된 숙소 주소 (체류지)',
    p_nation: '숙소 제공자 국적',
    p_id: '숙소 제공자 식별번호 (주민/사업자)',
    p_name: '숙소 제공자 상호 또는 대표자',
    p_phone: '숙소 제공자 전화번호',
    rel_family: '관계: 가족 [V]',
    rel_employer: '관계: 고용주 [V]',
    rel_other: '관계: 기타 [V]',
    rel_other_desc: '관계 기타 상세',
    own_self: '소유형태: 자가 [V]',
    own_rent: '소유형태: 임대 [V]',
    own_other: '소유형태: 기타 [V]',
    own_other_desc: '소유형태 기타 상세',
    type_private: '주거형태: 개인주택 [V]',
    type_dorm: '주거형태: 기숙사 [V]',
    type_hotel: '주거형태: 숙박업소 [V]',
    type_other: '주거형태: 기타 [V]',
    type_other_desc: '주거형태 기타 상세',
    start_y: '숙소제공 개시연도',
    start_m: '숙소제공 개시월',
    start_d: '숙소제공 개시일',
    sign_y: '확인서 작성연도',
    sign_m: '확인서 작성월',
    sign_d: '확인서 작성일',
    p_sign_name: '숙소제공자 대표자 서명',
    p_company: '숙소제공자 회사 상호'
  },
  guarantee: {
    f_surname: '피보증인 영문 성',
    f_givenname: '피보증인 영문 명',
    f_hanja: '피보증인 한자성명',
    f_dob: '피보증인 생년월일',
    f_sex_m: '피보증인 성별: 남 [V]',
    f_sex_f: '피보증인 성별: 여 [V]',
    f_nation: '피보증인 국적',
    f_pass: '피보증인 여권번호',
    f_addr: '피보증인 국내 주소',
    f_phone: '피보증인 전화번호',
    f_purpose: '체류목적 (취업 등)',
    p_name: '보증인 대표자명',
    p_hanja: '보증인 한자성명',
    p_nation: '보증인 국적',
    p_sex_m: '보증인 성별: 남 [V]',
    p_sex_f: '보증인 성별: 여 [V]',
    p_dob: '보증인 주민/식별번호',
    p_phone: '보증인 전화번호',
    p_addr: '보증인 자택/회사 주소',
    p_rel: '피보증인과의 관계 (고용주)',
    p_company: '보증인 소속 회사 상호',
    p_job: '보증인 직위 (대표이사)',
    p_caddr: '보증인 근무처 주소',
    p_note: '보증인 비고',
    p_period: '보증기간',
    sign_y: '보증서 작성연도',
    sign_m: '보증서 작성월',
    sign_d: '보증서 작성일',
    p_sign_name: '보증인 서명란'
  },
  income: {
    f_name: '신고인 성명 (Full Name)',
    f_arc: '외국인등록번호 (Alien Reg No.)',
    f_nation: '국적 (Nationality)',
    f_visa: '체류자격 (Sojourn Status)',
    f_sojourn_status: '체류자격 (Sojourn Status)',
    f_phone: '전화번호 (Telephone)',
    f_email: '전자우편 주소 (E-mail)',
    c_name: '근무처 상호 (Company Name)',
    c_regno: '사업자등록번호 (Business Reg No.)',
    c_job: '직업명 (Job Title)',
    job_title: '직업명 (Job Title)',
    c_job_code: '한국표준직업분류 코드 (KSCO Code)',
    job_code: '한국표준직업분류 코드 (KSCO Code)',
    c_income_won: '연간 소득금액 (Annual Income)',
    annual_income: '연간 소득금액 (Annual Income)',
    c_income_bracket: '소득금액 입증서류 첨부 구분 [V]',
    income_tax_proof: '소득금액 입증서류 첨부 구분 [V]',
    sign_y: '신고서 작성연도',
    sign_m: '신고서 작성월',
    sign_d: '신고서 작성일',
    f_sign: '신고인 성명 및 서명',
    declarant_name: '신고인 성명 및 서명'
  }
};

export interface CustomDocItem {
  id: string;
  title: string;
  desc: string;
  createdAt: string;
  isPreset?: boolean;
}

export interface AvailableFieldOption {
  key: string;
  label: string;
  category: '신청인(외국인)' | '근무처(고용주)' | '직무/소득' | '날짜/서명' | '체크/기타';
  type: 'text' | 'check';
  defaultW: number;
  defaultH: number;
  sampleValue?: string;
}

export const AVAILABLE_MAPPING_FIELDS: AvailableFieldOption[] = [
  // 신청인(외국인)
  { key: 'f_name', label: '외국인 성명 (Full Name, 대문자)', category: '신청인(외국인)', type: 'text', defaultW: 160, defaultH: 20, sampleValue: 'BUI QUOC TINH' },
  { key: 'f_surname', label: '외국인 성 (Surname)', category: '신청인(외국인)', type: 'text', defaultW: 80, defaultH: 20, sampleValue: 'BUI' },
  { key: 'f_givenname', label: '외국인 이름 (Given name)', category: '신청인(외국인)', type: 'text', defaultW: 100, defaultH: 20, sampleValue: 'QUOC TINH' },
  { key: 'f_arc', label: '외국인등록번호 (000000-0000000)', category: '신청인(외국인)', type: 'text', defaultW: 140, defaultH: 20, sampleValue: '800812-5000000' },
  { key: 'f_arc_front', label: '외국인등록번호 앞자리 (6자리)', category: '신청인(외국인)', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '800812' },
  { key: 'f_arc_back', label: '외국인등록번호 뒷자리 (7자리)', category: '신청인(외국인)', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '5000000' },
  { key: 'f_dob', label: '생년월일 (YYYY-MM-DD)', category: '신청인(외국인)', type: 'text', defaultW: 100, defaultH: 20, sampleValue: '1980-08-12' },
  { key: 'f_dob_yyyy', label: '생년 (YYYY)', category: '신청인(외국인)', type: 'text', defaultW: 40, defaultH: 20, sampleValue: '1980' },
  { key: 'f_dob_mm', label: '생월 (MM)', category: '신청인(외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '08' },
  { key: 'f_dob_dd', label: '생일 (DD)', category: '신청인(외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '12' },
  { key: 'f_gender', label: '성별 (M / F)', category: '신청인(외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: 'M' },
  { key: 'f_nation', label: '국적 (Nationality)', category: '신청인(외국인)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: 'VIETNAM' },
  { key: 'f_visa', label: '체류자격 / 비자 (E-9, E-7 등)', category: '신청인(외국인)', type: 'text', defaultW: 60, defaultH: 20, sampleValue: 'E-9' },
  { key: 'f_passport', label: '여권번호 (Passport No.)', category: '신청인(외국인)', type: 'text', defaultW: 110, defaultH: 20, sampleValue: 'E03861791' },
  { key: 'f_pass_issue', label: '여권발급일 (Issue Date)', category: '신청인(외국인)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '2020-01-01' },
  { key: 'f_pass_exp', label: '여권만료일 (Expiry Date)', category: '신청인(외국인)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '2030-01-01' },
  { key: 'f_phone', label: '휴대전화 / 연락처', category: '신청인(외국인)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '010-1234-5678' },
  { key: 'f_email', label: '이메일 (E-mail)', category: '신청인(외국인)', type: 'text', defaultW: 160, defaultH: 20, sampleValue: 'worker@email.com' },
  { key: 'f_addr', label: '국내 체류지 주소', category: '신청인(외국인)', type: 'text', defaultW: 280, defaultH: 24, sampleValue: '전라남도 영암군 삼호읍 신항로 10' },
  { key: 'f_addr_home', label: '본국 주소', category: '신청인(외국인)', type: 'text', defaultW: 240, defaultH: 24, sampleValue: 'SON HA, THAI THUY, VIETNAM' },

  // 근무처(고용주)
  { key: 'c_name', label: '근무처 상호 / 회사명', category: '근무처(고용주)', type: 'text', defaultW: 180, defaultH: 20, sampleValue: '에이치디현대삼호 주식회사' },
  { key: 'c_regno', label: '사업자등록번호 (10자리)', category: '근무처(고용주)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '411-81-19799' },
  { key: 'c_rep', label: '대표자 성명', category: '근무처(고용주)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '김재을' },
  { key: 'c_rep_id', label: '대표자 주민번호', category: '근무처(고용주)', type: 'text', defaultW: 130, defaultH: 20, sampleValue: '650101-1******' },
  { key: 'c_addr', label: '사업장 소재지 주소', category: '근무처(고용주)', type: 'text', defaultW: 280, defaultH: 24, sampleValue: '전라남도 영암군 삼호읍 대불로 93' },
  { key: 'c_phone', label: '사업장 전화번호', category: '근무처(고용주)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '061-460-2114' },

  // 직무/소득
  { key: 'job_title', label: '직종명 / 담당업무', category: '직무/소득', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '조선용접원' },
  { key: 'job_code', label: '한국표준직업분류 코드 (KSCO)', category: '직무/소득', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '7431' },
  { key: 'annual_income', label: '연간 소득금액 (원)', category: '직무/소득', type: 'text', defaultW: 110, defaultH: 20, sampleValue: '36,000,000 원' },
  { key: 'monthly_income', label: '월 급여 (원)', category: '직무/소득', type: 'text', defaultW: 110, defaultH: 20, sampleValue: '3,000,000 원' },

  // 날짜/서명
  { key: 'today_date', label: '작성일자 (YYYY.MM.DD)', category: '날짜/서명', type: 'text', defaultW: 100, defaultH: 20, sampleValue: '2026.09.25' },
  { key: 'sign_y', label: '작성 연도 (YYYY)', category: '날짜/서명', type: 'text', defaultW: 45, defaultH: 20, sampleValue: '2026' },
  { key: 'sign_m', label: '작성 월 (MM)', category: '날짜/서명', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '09' },
  { key: 'sign_d', label: '작성 일 (DD)', category: '날짜/서명', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '25' },
  { key: 'sign_f', label: '신청인(외국인) 서명란', category: '날짜/서명', type: 'text', defaultW: 130, defaultH: 20, sampleValue: 'BUI QUOC TINH' },
  { key: 'sign_rep', label: '고용주(대표자) 서명란', category: '날짜/서명', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '김재을' },

  // 체크/기타
  { key: 'check_box', label: 'V 체크마크 (선택/확인)', category: '체크/기타', type: 'check', defaultW: 14, defaultH: 14, sampleValue: 'V' },
  { key: 'custom_text', label: '사용자 지정 텍스트 (고정문구)', category: '체크/기타', type: 'text', defaultW: 150, defaultH: 20, sampleValue: '체류기간 연장' }
];

export const BUILTIN_PRESET_DOCS: CustomDocItem[] = [
  {
    id: 'e74r_recommend',
    title: '지자체 추천 신청서 (E-7-4R <붙임 1>)',
    desc: '2026년 숙련기능인력 비자 지자체(전남도·영암군) 추천 신청서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_score_sheet',
    title: '점수제 자체 심사표 (E-7-4R <붙임 2-1>)',
    desc: '소득·한국어·나이·지자체 가점 등 280점 만점 자동 채점 심사표',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_personal_stmt',
    title: '외국인 신상 기술서 (E-7-4R <붙임 3-1>)',
    desc: '학력, 혼인일자, 본국 및 국내 체류 동반가족 기술서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_company_recommend',
    title: '고용기업 추천서 (E-7-4R [붙임])',
    desc: '협력사 대표자 추천 및 사업장 고용쿼터(내외국인 총원 대비) 확인서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'contract_std',
    title: '표준근로계약서 (조선업 Labor Contract)',
    desc: 'E-7-4/E-7-3 필수요건(2년 이상 계약, 연 2600만원 이상) 반영 근로계약서',
    createdAt: '2026-09-25',
    isPreset: true
  },
  {
    id: 'employment_cert',
    title: '재직(경력) 증명서 (출입국 제출용)',
    desc: '사내협력사 소속 재직기간, 직무(도장/용접), 사업장 소재지 증명서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'reason_stmt',
    title: '체류기간연장 사유서 (Reason Statement)',
    desc: '출입국·외국인관서 제출용 체류기간연장 및 고용유지 사유서',
    createdAt: '2026-09-25',
    isPreset: true
  },
  {
    id: 'power_of_attorney',
    title: '위임장 (Power of Attorney)',
    desc: '사내 업무담당자 또는 행정사 대리 신청 접수용 위임장',
    createdAt: '2026-09-25',
    isPreset: true
  }
];

export const PRESET_COORDS_CONTRACT: Record<string, PdfCoordBox> = {
  c_name: { type: 'text', x: 130, y: 720, w: 180, h: 18 },
  c_phone: { type: 'text', x: 380, y: 720, w: 140, h: 18 },
  c_addr: { type: 'text', x: 130, y: 695, w: 390, h: 18 },
  c_rep: { type: 'text', x: 130, y: 670, w: 140, h: 18 },
  f_name: { type: 'text', x: 130, y: 635, w: 180, h: 18 },
  f_dob: { type: 'text', x: 380, y: 635, w: 140, h: 18 },
  f_addr: { type: 'text', x: 130, y: 610, w: 390, h: 18 },
  job_title: { type: 'text', x: 150, y: 550, w: 160, h: 18 },
  monthly_income: { type: 'text', x: 180, y: 440, w: 140, h: 18 },
  today_date: { type: 'text', x: 230, y: 150, w: 140, h: 18 },
  sign_rep: { type: 'text', x: 420, y: 110, w: 90, h: 18 },
  sign_f: { type: 'text', x: 420, y: 75, w: 100, h: 18 }
};

export const PRESET_COORDS_REASON: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 710, w: 160, h: 18 },
  f_arc: { type: 'text', x: 380, y: 710, w: 140, h: 18 },
  f_nation: { type: 'text', x: 150, y: 680, w: 160, h: 18 },
  f_visa: { type: 'text', x: 380, y: 680, w: 140, h: 18 },
  c_name: { type: 'text', x: 150, y: 650, w: 180, h: 18 },
  c_rep: { type: 'text', x: 380, y: 650, w: 140, h: 18 },
  job_title: { type: 'text', x: 150, y: 620, w: 160, h: 18 },
  custom_text: { type: 'text', x: 100, y: 460, w: 400, h: 110 },
  today_date: { type: 'text', x: 230, y: 220, w: 140, h: 18 },
  sign_f: { type: 'text', x: 390, y: 180, w: 120, h: 18 },
  sign_rep: { type: 'text', x: 390, y: 145, w: 120, h: 18 }
};

export const PRESET_COORDS_ATTORNEY: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 700, w: 160, h: 18 },
  f_arc: { type: 'text', x: 380, y: 700, w: 140, h: 18 },
  f_addr: { type: 'text', x: 150, y: 670, w: 370, h: 18 },
  f_phone: { type: 'text', x: 150, y: 640, w: 160, h: 18 },
  c_rep: { type: 'text', x: 150, y: 560, w: 160, h: 18 },
  c_phone: { type: 'text', x: 380, y: 560, w: 140, h: 18 },
  today_date: { type: 'text', x: 230, y: 260, w: 140, h: 18 },
  sign_f: { type: 'text', x: 390, y: 200, w: 120, h: 18 }
};

export function resolveFieldValueForCoord(
  key: string,
  formData: FormData,
  customTextMap?: Record<string, string>
): { display: string; isChecked: boolean } {
  const upperSurname = (formData.i_surname || '').toUpperCase().trim();
  const upperGivenname = (formData.i_givenname || '').toUpperCase().trim();
  const fullName = `${upperSurname} ${upperGivenname}`.trim();
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const cleanArc = (formData.i_arc || '').replace(/-/g, '');

  if (key === 'check_box' || key.startsWith('chk_')) {
    return { display: 'V', isChecked: true };
  }

  if (customTextMap && customTextMap[key] !== undefined && customTextMap[key] !== '') {
    return { display: customTextMap[key], isChecked: false };
  }

  if (key === 'custom_text' || key.startsWith('custom_text_') || key.startsWith('custom_')) {
    const customVal = customTextMap?.[key] || '위 본인은 대한민국 출입국관리법에 의거하여 성실히 근무하고 체류자격을 연장 신청합니다.';
    return { display: customVal, isChecked: false };
  }

  switch (key) {
    // Applicant
    case 'f_name':
    case 'fullName':
    case 'name': return { display: fullName || 'BUI QUOC TINH', isChecked: false };
    case 'f_surname':
    case 'surname': return { display: upperSurname || 'BUI', isChecked: false };
    case 'f_givenname':
    case 'givenname': return { display: upperGivenname || 'QUOC TINH', isChecked: false };
    case 'f_arc':
    case 'arc': return { display: formData.i_arc || '800812-5000000', isChecked: false };
    case 'f_arc_front': return { display: cleanArc.slice(0, 6) || '800812', isChecked: false };
    case 'f_arc_back': return { display: cleanArc.slice(6, 13) || '5000000', isChecked: false };
    case 'f_dob':
    case 'dob': return { display: formData.i_dob || '1980-08-12', isChecked: false };
    case 'f_dob_yyyy': return { display: (formData.i_dob || '').split('-')[0] || '1980', isChecked: false };
    case 'f_dob_mm': return { display: (formData.i_dob || '').split('-')[1] || '08', isChecked: false };
    case 'f_dob_dd': return { display: (formData.i_dob || '').split('-')[2] || '12', isChecked: false };
    case 'f_gender': return { display: formData.i_gender || 'M', isChecked: false };
    case 'f_nation':
    case 'nation': return { display: (formData.i_nation || 'VIETNAM').toUpperCase(), isChecked: false };
    case 'f_visa':
    case 'visa':
    case 'f_sojourn_status': return { display: formData.visaType || 'E-9', isChecked: false };
    case 'f_passport':
    case 'passport': return { display: (formData.i_passport || 'E03861791').toUpperCase(), isChecked: false };
    case 'f_pass_issue': return { display: formData.i_pass_issue || '2020-01-01', isChecked: false };
    case 'f_pass_exp': return { display: formData.i_pass_exp || '2030-01-01', isChecked: false };
    case 'f_phone':
    case 'cellphone':
    case 'phone': return { display: formData.i_cellphone || formData.i_phone || '010-1234-5678', isChecked: false };
    case 'f_email':
    case 'email': return { display: formData.i_email || 'worker@email.com', isChecked: false };
    case 'f_addr':
    case 'address_kr': return { display: formData.i_address_kr || '전라남도 영암군 삼호읍 신항로 10', isChecked: false };
    case 'f_addr_home':
    case 'address_home': return { display: (formData.i_address_home || 'SON HA, THAI THUY, VIETNAM').toUpperCase(), isChecked: false };

    // Workplace
    case 'c_name':
    case 'cname': return { display: formData.i_cname || '에이치디현대삼호 주식회사', isChecked: false };
    case 'c_regno':
    case 'cregno': return { display: formData.i_cregno || '411-81-19799', isChecked: false };
    case 'c_rep':
    case 'rep_name': return { display: formData.i_rep_name || '김재을', isChecked: false };
    case 'c_rep_id':
    case 'rep_id': return { display: formData.i_rep_id || '650101-1******', isChecked: false };
    case 'c_addr':
    case 'caddr': return { display: formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93', isChecked: false };
    case 'c_phone':
    case 'cphone': return { display: formData.i_cphone || '061-460-2114', isChecked: false };

    // Job / Income
    case 'job_title':
    case 'job':
    case 'c_job': return { display: formData.i_job || '선박도장원', isChecked: false };
    case 'job_code':
    case 'c_job_code': return { display: formData.i_job_code || '7832', isChecked: false };
    case 'annual_income':
    case 'c_income_won': {
      const val = formData.i_income ? `${formData.i_income}0,000` : '36,000,000';
      return { display: `${val} 원`, isChecked: false };
    }
    case 'monthly_income': {
      const rawNum = parseInt((formData.i_income || '3240').replace(/[^0-9]/g, ''), 10) || 3240;
      const mVal = Math.round((rawNum * 10000) / 12).toLocaleString();
      return { display: `${mVal} 원`, isChecked: false };
    }

    // E-7-4R and Labor Contract Extended Fields
    case 'marriage': return { display: formData.i_marriage || '기혼', isChecked: false };
    case 'marriage_date': return { display: formData.i_marriage_date || '2018.01.30', isChecked: false };
    case 'education': return { display: formData.i_education || '고등학교 졸업', isChecked: false };
    case 'total_workers': return { display: formData.i_total_workers || '138명', isChecked: false };
    case 'e74_workers': return { display: formData.i_e74_workers || '13명', isChecked: false };
    case 'work_period': return { display: formData.i_work_period || '총 약 1년 7개월', isChecked: false };
    case 'f_spouse':
    case 'spouse_name': return { display: (formData.i_spouse || 'MUKHTOROVA DILNOZA').toUpperCase(), isChecked: false };
    case 'spouse_dob': return { display: formData.i_spouse_dob || '1992.09.03', isChecked: false };
    case 'child1_name': return { display: (formData.i_child1_name || 'IKROMOV SAIDXON NAJIBULLO UGLI').toUpperCase(), isChecked: false };
    case 'child1_dob': return { display: formData.i_child1_dob || '2018.12.18', isChecked: false };
    case 'child2_name': return { display: (formData.i_child2_name || 'IKROMOV SAIDOLIMXON NAJIBULLO UGLI').toUpperCase(), isChecked: false };
    case 'child2_dob': return { display: formData.i_child2_dob || '2021.11.02', isChecked: false };
    case 'score_total': return { display: '280점 (합격선 충족)', isChecked: false };

    // Dates / Signs
    case 'today_date':
    case 'app_date': return { display: `${ty}.${tm}.${td}`, isChecked: false };
    case 'sign_y': return { display: ty, isChecked: false };
    case 'sign_m': return { display: tm, isChecked: false };
    case 'sign_d': return { display: td, isChecked: false };
    case 'sign_f':
    case 'f_sign':
    case 'sign_main':
    case 'declarant_name': return { display: fullName || 'BUI QUOC TINH', isChecked: false };
    case 'sign_rep':
    case 'p_sign_name': return { display: formData.i_rep_name || '김재을', isChecked: false };

    default:
      if (customTextMap && customTextMap[key]) {
        return { display: customTextMap[key], isChecked: false };
      }
      return { display: '', isChecked: false };
  }
}
