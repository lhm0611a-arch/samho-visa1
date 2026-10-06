import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { FormData } from '../types';

const COLOR_TEXT = rgb(0.1, 0.1, 0.1);
const COLOR_MUTED = rgb(0.4, 0.4, 0.4);
const COLOR_BORDER = rgb(0.65, 0.65, 0.65);
const COLOR_HEADER_BG = rgb(0.93, 0.95, 0.98);
const COLOR_RED_STAMP = rgb(0.85, 0.1, 0.1);

function drawTableBox(page: PDFPage, x: number, y: number, w: number, h: number, bg?: any) {
  if (bg) {
    page.drawRectangle({ x, y, width: w, height: h, color: bg });
  }
  page.drawRectangle({
    x, y, width: w, height: h,
    borderWidth: 1,
    borderColor: COLOR_BORDER
  });
}

function drawStamp(page: PDFPage, font: any, x: number, y: number, repName: string) {
  page.drawCircle({ x, y, size: 23, color: rgb(0.98, 0.95, 0.95), borderColor: COLOR_RED_STAMP, borderWidth: 1.5 });
  page.drawText('대표이사', { x: x - 15, y: y + 4, size: 7, font, color: COLOR_RED_STAMP });
  page.drawText(`${repName.slice(0, 3)}인`, { x: x - 15, y: y - 7, size: 7, font, color: COLOR_RED_STAMP });
}

// 1. <붙임 1> 숙련기능인력 비자 지자체 추천 신청서 (E-7-4R)
export async function renderE74RRecommend(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  // Top header
  page.drawText('<붙임 1> 숙련기능인력 비자 지자체 추천 신청서', { x: 40, y: 800, size: 10, font, color: COLOR_TEXT });
  
  // Title
  page.drawText('2026년 숙련기능인력 비자 지자체 추천(서) 신청서', { x: 105, y: 760, size: 15, font, color: COLOR_TEXT });
  page.drawText('※ (*)는 필수적 기재항목입니다.', { x: 40, y: 735, size: 8, font, color: COLOR_MUTED });

  let curY = 725;
  const tableW = 515;

  // 1. 신청 유형
  drawTableBox(page, 40, curY - 24, 110, 24, COLOR_HEADER_BG);
  page.drawText('신청 유형(*)\n  (택 1)', { x: 48, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 24, tableW - 110, 24);
  page.drawText('① 일반 숙련기능인력(E-7-4)  [   ]       ② 지역특화 숙련기능인력(E-7-4R)  [ V ]', { x: 165, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // 2. 개인정보
  drawTableBox(page, 40, curY - 76, 110, 76, COLOR_HEADER_BG);
  page.drawText('개인정보(*)', { x: 62, y: curY - 42, size: 9, font, color: COLOR_TEXT });

  // 성명 / 등록번호
  drawTableBox(page, 150, curY - 25, 60, 25, COLOR_HEADER_BG);
  page.drawText('성명', { x: 168, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 25, 130, 25);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 215, y: curY - 17, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 25, 80, 25, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 345, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 25, tableW - 380, 25);
  page.drawText(formData.i_arc || '880519-5600011', { x: 425, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  // 주소
  drawTableBox(page, 150, curY - 50, 60, 25, COLOR_HEADER_BG);
  page.drawText('주소\n(거주지)', { x: 162, y: curY - 43, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 50, tableW - 170, 25);
  page.drawText(formData.i_address_kr || '전라남도 영암군 삼호읍 신항로 120-28, 신성빌 302호', { x: 215, y: curY - 42, size: 8, font, color: COLOR_TEXT });

  // 연락처
  drawTableBox(page, 150, curY - 76, 60, 26, COLOR_HEADER_BG);
  page.drawText('연락처', { x: 163, y: curY - 69, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 76, tableW - 170, 26);
  page.drawText(`휴대전화: ${formData.i_cellphone || '010-4832-8805'}     전자우편: ${formData.i_email || '-'}`, { x: 215, y: curY - 69, size: 8.5, font, color: COLOR_TEXT });
  curY -= 76;

  // 3. 체류자격 및 국적
  drawTableBox(page, 40, curY - 25, 110, 25, COLOR_HEADER_BG);
  page.drawText('체류자격\n및 국적(*)', { x: 60, y: curY - 19, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 25, tableW - 110, 25);
  page.drawText(`① 현재 체류자격: [ ${formData.visaType === 'E-7-4R' ? 'E-9' : formData.visaType} ]       ② 국 적: [ ${formData.i_nation || '우즈베키스탄'} ]`, { x: 165, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  // 4. 고용업체
  drawTableBox(page, 40, curY - 60, 110, 60, COLOR_HEADER_BG);
  page.drawText('고용업체(*)', { x: 62, y: curY - 35, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 20, 60, 20, COLOR_HEADER_BG);
  page.drawText('회사명', { x: 163, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 20, 130, 20);
  page.drawText(formData.i_cname || '(유)가영테크', { x: 215, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 20, 80, 20, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 345, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 20, tableW - 380, 20);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 425, y: curY - 15, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 40, 60, 20, COLOR_HEADER_BG);
  page.drawText('업체주소', { x: 158, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 40, tableW - 170, 20);
  page.drawText(formData.i_caddr || '전남 영암군 삼호읍 대불로 93 (현대삼호중공업 內)', { x: 215, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 60, 60, 20, COLOR_HEADER_BG);
  page.drawText('대표자 성명', { x: 153, y: curY - 55, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 60, 130, 20);
  page.drawText(formData.i_rep_name || '김삼춘', { x: 215, y: curY - 55, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 60, 80, 20, COLOR_HEADER_BG);
  page.drawText('연락처', { x: 360, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 60, tableW - 380, 20);
  page.drawText(formData.i_cphone || '061-462-3588', { x: 425, y: curY - 55, size: 8.5, font, color: COLOR_TEXT });
  curY -= 60;

  // 5. 안내사항
  drawTableBox(page, 40, curY - 60, 110, 60, COLOR_HEADER_BG);
  page.drawText('안내사항', { x: 68, y: curY - 35, size: 9, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 60, tableW - 110, 60);
  page.drawText('1. 지역특화 숙련기능인력(E-7-4R)의 경우 전라남도의 추천을 받은 경우\n   전라남도(영암군 등 인구감소지역)에서 의무적으로 3년 동안 거주하여야 합니다.', { x: 155, y: curY - 20, size: 7.5, font, color: COLOR_TEXT });
  page.drawText('2. 추천(서)이 체류자격 변경을 보장하는 것은 아니며, 법무부 체류자격 변경 심사 결과에\n   따라 전환 여부가 최종 결정됩니다.', { x: 155, y: curY - 45, size: 7.5, font, color: COLOR_TEXT });
  curY -= 60;

  // 6. 개인정보제공 동의여부
  drawTableBox(page, 40, curY - 80, 110, 80, COLOR_HEADER_BG);
  page.drawText('개인정보제공\n 동의여부', { x: 55, y: curY - 45, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 80, tableW - 110, 80);
  page.drawText('1. 개인정보 수집·이용 동의 여부 :       [ V ] 동의          [   ] 동의하지 않음', { x: 155, y: curY - 22, size: 8, font, color: COLOR_TEXT });
  page.drawText('   - 수집·이용기관: 전라남도, 영암군, 법무부 / 보유기간: 체류자격 변경 심사 완료 시까지', { x: 165, y: curY - 36, size: 7, font, color: COLOR_MUTED });
  page.drawText('2. 개인정보 제3자 제공 동의 여부 :      [ V ] 동의          [   ] 동의하지 않음', { x: 155, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  page.drawText('   - 제공받는 자: 전라남도 광역지자체 및 유관기관 / 목적: 취업알선 및 정착지원 서비스', { x: 165, y: curY - 69, size: 7, font, color: COLOR_MUTED });
  curY -= 80;

  // Bottom statement
  page.drawText('위에 적은 사항은 사실과 틀림이 없음을 확인합니다.', { x: 160, y: curY - 45, size: 10, font, color: COLOR_TEXT });
  page.drawText(`${ty}년      ${tm}월      ${td}일`, { x: 380, y: curY - 75, size: 9, font, color: COLOR_TEXT });
  page.drawText(`신청인:  ${fullName}  (서명 또는 인)`, { x: 260, y: curY - 105, size: 9.5, font, color: COLOR_TEXT });

  // Footer stamp
  drawStamp(page, font, 490, curY - 105, formData.i_rep_name || '김삼춘');
}

// 2. <붙임 2-1> 점수제 자체 심사표 [지역특화형] (E-7-4R)
export async function renderE74RScoreSheet(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('<붙임 2-1> 점수제 자체 심사표 [지역특화형]', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('점수제 자체 심사표 : 외국인 본인이 작성', { x: 180, y: 780, size: 13, font, color: COLOR_TEXT });
  page.drawText('(주의) 신청인 또는 근무처가 점수제 숙련기능인력 전환에 관한 서류를 허위 제출하거나 허위 진술한 경우 비자 제한 등 불이익 처벌을 받습니다.', { x: 40, y: 755, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.12, 0.22, 0.42) });
  page.drawText('지역특화형 숙련기능인력(E-7-4R) 점수제 자체 심사표', { x: 140, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  // Worker header
  drawTableBox(page, 40, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('영문 성명', { x: 50, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 24, 155, 24);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 115, y: curY - 17, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 270, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 24, tableW - 310, 24);
  page.drawText(formData.i_arc || '880519-5600011', { x: 360, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 40, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('회사명', { x: 55, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 24, 155, 24);
  page.drawText(formData.i_cname || '(유)가영테크', { x: 115, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('국 적', { x: 295, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 24, tableW - 310, 24);
  page.drawText(formData.i_nation || '우즈베키스탄', { x: 360, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // Basic Requirements Box
  drawTableBox(page, 40, curY - 70, 70, 70, COLOR_HEADER_BG);
  page.drawText('기본요건\n(모두 충족)', { x: 45, y: curY - 40, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 70, tableW - 70, 70);
  page.drawText('㉠ 최근 10년간 해당 자격(E-9, E-10, H-2)으로 2년 이상 체류한 등록외국인 [ O ]', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  page.drawText('㉡ 추천지역을 관할하는 광역지방자치단체장(전남도지사)의 추천서를 발급받음 [ O ]', { x: 120, y: curY - 34, size: 8, font, color: COLOR_TEXT });
  page.drawText('㉢ 3년 이상 추천지역 거주 및 연봉 2,600만원 이상으로 2년 이상 E-7-4 고용계약 체결 [ O ]', { x: 120, y: curY - 50, size: 8, font, color: COLOR_TEXT });
  page.drawText('㉣ 현재 1년 이상 정상 근무 중인 기업(가영테크 등)의 추천을 받았음 [ O ]', { x: 120, y: curY - 65, size: 8, font, color: COLOR_TEXT });
  curY -= 70;

  // Score Table Header
  drawTableBox(page, 40, curY - 22, 260, 22, COLOR_HEADER_BG);
  page.drawText('구      분', { x: 140, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 300, curY - 22, 60, 22, COLOR_HEADER_BG);
  page.drawText('점 수', { x: 318, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 22, tableW - 320, 22, COLOR_HEADER_BG);
  page.drawText('제 출 서 류', { x: 420, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  curY -= 22;

  const scoreRows = [
    { label: '기본 ① 최근 2년 연간 평균소득 (4,500만원 이상 구간)', score: '80', proof: '소득금액증명원 (최근 2개년 국세청 홈택스)' },
    { label: '기본 ② 한국어 능력 (사회통합프로그램 2단계 이상 또는 TOPIK)', score: '50', proof: '사회통합프로그램(KIIP) 교육확인서' },
    { label: '기본 ③ 나이 요건 (만 35세 미만 우대)', score: '30', proof: '외국인등록증 및 여권 사본' },
    { label: '▶ 기본항목 소계 (합격 기준선 충족)', score: '160', proof: '기준 충족 (최소 50점 이상 필요)', isSubtotal: true },
    { label: '가점 ① 광역지방자치단체 추천 (전라남도)', score: '50', proof: '전라남도 비자 지자체 추천서' },
    { label: '가점 ② 고용기업 추천 (현대삼호 협력사)', score: '50', proof: '고용기업 대표자 추천서' },
    { label: '가점 ③ 인구감소지역(영암군) 3년 이상 근무/거주', score: '20', proof: '재직증명서 / 4대보험 가입자 명부' },
    { label: '▶ 가점항목 소계', score: '120', proof: '최대 가점 확보', isSubtotal: true },
    { label: '감점 항목 (벌금·조세체납·출입국관리법 위반 없음)', score: '0', proof: '국세 및 지방세 완납증명서 제출' }
  ];

  scoreRows.forEach(r => {
    const bg = r.isSubtotal ? rgb(0.95, 0.97, 0.92) : undefined;
    drawTableBox(page, 40, curY - 20, 260, 20, bg);
    page.drawText(r.label, { x: 45, y: curY - 14, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(page, 300, curY - 20, 60, 20, bg);
    page.drawText(r.score, { x: 322, y: curY - 14, size: 8, font, color: COLOR_TEXT });
    drawTableBox(page, 360, curY - 20, tableW - 320, 20, bg);
    page.drawText(r.proof, { x: 368, y: curY - 14, size: 7, font, color: COLOR_MUTED });
    curY -= 20;
  });

  // Total Score Row
  drawTableBox(page, 40, curY - 28, 260, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('총      점  (합격선 200점 대비 80점 초과 완벽 통과)', { x: 60, y: curY - 18, size: 9, font, color: rgb(0.1, 0.2, 0.5) });
  drawTableBox(page, 300, curY - 28, 60, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('280', { x: 318, y: curY - 18, size: 11, font, color: rgb(0.1, 0.2, 0.5) });
  drawTableBox(page, 360, curY - 28, tableW - 320, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('전환 추천 및 허가 요건 완벽 충족', { x: 380, y: curY - 18, size: 8.5, font, color: rgb(0.1, 0.2, 0.5) });
  curY -= 28;

  // Date and sign
  page.drawText(`작성일:  ${ty}.   ${tm}.   ${td}.`, { x: 60, y: curY - 50, size: 9.5, font, color: COLOR_TEXT });
  page.drawText(`작성자:  ${fullName}  (서명)`, { x: 300, y: curY - 50, size: 9.5, font, color: COLOR_TEXT });
}

// 3. <붙임 3-1> 신상 기술서 [지역특화형] (E-7-4R)
export async function renderE74RPersonalStmt(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('<붙임 3-1> 신상기술서 [지역특화형]', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('신상 기술서 : 외국인 본인이 작성', { x: 190, y: 780, size: 13, font, color: COLOR_TEXT });
  page.drawText('(주의) 허위 사실을 기재·진술한 경우 비자 신청 제한 등 불이익을 받을 수 있으며 법령에 따라 형사처벌을 받을 수 있음', { x: 40, y: 755, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.15, 0.25, 0.45) });
  page.drawText('지역특화형 숙련기능인력(E-7-4R) 외국인 신상 기술서', { x: 145, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('영문 성명', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 120, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 270, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_arc || '880519-5600011', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('국  적', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText(formData.i_nation || '우즈베키스탄', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('전화 번호', { x: 285, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_cellphone || '010-4832-8805', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('최종학력', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText('[ V ] 고졸    [   ] 학사    [   ] 석사', { x: 120, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('최종학교명', { x: 280, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_education || '고등학교 졸업', { x: 360, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('결혼 여부', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText('[ V ] 결혼        [   ] 미혼', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('결혼 일자', { x: 285, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_marriage_date || '2018.01.30', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  // Family Table Header
  drawTableBox(page, 40, curY - 26, 75, 104, COLOR_HEADER_BG);
  page.drawText('가족 관계', { x: 55, y: curY - 56, size: 9, font, color: COLOR_TEXT });

  const familyRows = [
    { rel: '배우자', name: formData.i_spouse || 'MUKHTOROVA DILNOZA', dob: formData.i_spouse_dob || '1992.09.03' },
    { rel: '자녀 1', name: formData.i_child1_name || 'IKROMOV SAIDXON NAJIBULLO UGLI', dob: formData.i_child1_dob || '2018.12.18' },
    { rel: '자녀 2', name: formData.i_child2_name || 'IKROMOV SAIDOLIMXON NAJIBULLO UGLI', dob: formData.i_child2_dob || '2021.11.02' },
    { rel: '자녀 3', name: '-', dob: '-' }
  ];

  familyRows.forEach(f => {
    drawTableBox(page, 115, curY - 26, 50, 26, COLOR_HEADER_BG);
    page.drawText(f.rel, { x: 125, y: curY - 18, size: 8, font, color: COLOR_TEXT });

    drawTableBox(page, 165, curY - 26, 165, 26);
    page.drawText(f.name, { x: 170, y: curY - 18, size: 7, font, color: COLOR_TEXT });

    drawTableBox(page, 330, curY - 26, 85, 26);
    page.drawText(f.dob, { x: 340, y: curY - 18, size: 8, font, color: COLOR_TEXT });

    drawTableBox(page, 415, curY - 26, tableW - 375, 26);
    page.drawText(f.name !== '-' ? '[   ] 있음      [ V ] 없음' : '[   ] 있음      [   ] 없음', { x: 425, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
    curY -= 26;
  });

  page.drawText('상기 내용이 모두 사실임을 확인합니다.', { x: 185, y: curY - 60, size: 11, font, color: COLOR_TEXT });
  page.drawText(`작성일:  ${ty}.   ${tm}.   ${td}.`, { x: 70, y: curY - 100, size: 9.5, font, color: COLOR_TEXT });
  page.drawText(`작성자:  ${fullName}  (서명)`, { x: 300, y: curY - 100, size: 9.5, font, color: COLOR_TEXT });
}

// 4. [붙임] 고용기업 추천 양식 (E-7-4R)
export async function renderE74RCompanyRecommend(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('[붙임] 고용기업 추천 양식', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('(주의) 기업체 추천은 해당 외국인이 현재 근무 중인 사업체의 대표자만 추천할 수 있습니다.', { x: 40, y: 775, size: 8, font, color: COLOR_MUTED });
  page.drawText('※ 부정한 추천 등 위반 시 추천자 및 기업, 외국인 모두 법령에 따라 형사처벌을 받을 수 있습니다.', { x: 40, y: 760, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.12, 0.28, 0.45) });
  page.drawText('지역특화형 숙련기능인력(E-7-4R) 고용기업 추천서', { x: 145, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  // 1. 외국인 정보
  drawTableBox(page, 40, curY - 72, 60, 72, COLOR_HEADER_BG);
  page.drawText('외국인', { x: 55, y: curY - 40, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('영문명', { x: 118, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, 150, 24);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 175, y: curY - 17, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 325, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 24, tableW - 365, 24);
  page.drawText(formData.i_arc || '880519-5600011', { x: 415, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('국  적', { x: 120, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, 150, 24);
  page.drawText(formData.i_nation || 'UZBEKISTAN', { x: 175, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('성  별', { x: 350, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 24, tableW - 365, 24);
  page.drawText(formData.i_gender === 'M' ? '남 (Male)' : '여 (Female)', { x: 415, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('근무기간', { x: 115, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, tableW - 130, 24);
  page.drawText(formData.i_work_period || '총 약 1년 7개월 (2025.01.23 ~ 2026.08.23 정상 근무)', { x: 175, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // 2. 추천자(기업) 정보
  drawTableBox(page, 40, curY - 100, 60, 100, COLOR_HEADER_BG);
  page.drawText('추천자', { x: 55, y: curY - 55, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('업체명', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(formData.i_cname || '(유)가영테크', { x: 175, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 325, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 415, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('대표자', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(formData.i_rep_name || '김삼춘', { x: 175, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('상시근로자 수', { x: 328, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(`${formData.i_total_workers || '138'} 명 (고용보험 가입)`, { x: 415, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('E-7-4 고용수', { x: 108, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(`${formData.i_e74_workers || '13'} 명 (쿼터 기준 충족)`, { x: 175, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('전화번호', { x: 345, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(formData.i_cphone || '061-462-3588', { x: 415, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('소재지', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, tableW - 130, 25);
  page.drawText(formData.i_caddr || '전남 영암군 삼호읍 대불로 93 (현대삼호중공업 內)', { x: 175, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 25;

  // Recommendation Box
  drawTableBox(page, 40, curY - 80, 60, 80, COLOR_HEADER_BG);
  page.drawText('추천\n내용', { x: 60, y: curY - 45, size: 9, font, color: COLOR_TEXT });
  drawTableBox(page, 100, curY - 80, tableW - 60, 80);
  page.drawText('위 외국인이 현재 1년 이상 우리 업체에 정상 근무 중인 것이 확실하며,\n업무 숙련도 및 사회통합도 등을 충분히 갖추고 있어 숙련기능인력(E-7-4)에 해당되는 것은 물론,\n미래 대한민국의 사회일원으로서 충분한 자질과 능력을 갖추고 있다고 판단하여\n추천자 사업장에 꼭 필요한 필수 숙련 기능인력으로 적극 추천합니다.', { x: 110, y: curY - 22, size: 7.5, font, color: COLOR_TEXT });
  curY -= 80;

  // Attachment
  drawTableBox(page, 40, curY - 24, tableW, 24);
  page.drawText('붙임: 추천자 신분증 사본 (주민등록증 또는 사업자등록증)', { x: 50, y: curY - 16, size: 8, font, color: COLOR_TEXT });
  curY -= 24;

  // Date and sign
  page.drawText(`${ty}년      ${tm}월      ${td}일`, { x: 380, y: curY - 50, size: 9, font, color: COLOR_TEXT });
  page.drawText(`위 추천자 성명:  ${formData.i_cname || '(유)가영테크'}  대표  ${formData.i_rep_name || '김삼춘'}   (서명/인)`, { x: 160, y: curY - 85, size: 9.5, font, color: COLOR_TEXT });
  drawStamp(page, font, 495, curY - 85, formData.i_rep_name || '김삼춘');
}

// 5. 조선업 표준 근로계약서 (Labor Contract - 2 Pages)
export async function renderLaborContract(pdfDoc: PDFDocument, font: any, formData: FormData) {
  // Page 1
  const p1 = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const nextTy = String(parseInt(ty) + 2);
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  p1.drawText('근로계약서 견본 / Labor Contract (Sample)', { x: 160, y: 800, size: 13, font, color: COLOR_TEXT });
  p1.drawText('아래 당사자는 다음과 같이 근로계약을 체결하고 이를 성실히 이행할 것을 약정한다.', { x: 40, y: 775, size: 7.5, font, color: COLOR_MUTED });
  p1.drawText('(The following parties agree to fully comply with the terms of the contract stated hereinafter.)', { x: 40, y: 763, size: 7, font, color: COLOR_MUTED });

  let curY = 750;
  const tableW = 515;

  // Employer block
  drawTableBox(p1, 40, curY - 60, 60, 60, COLOR_HEADER_BG);
  p1.drawText('사용자\nEmployer', { x: 48, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('업체명', { x: 115, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 20, 160, 20);
  p1.drawText(formData.i_cname || '(유)가영테크', { x: 165, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('전화번호', { x: 332, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 20, tableW - 340, 20);
  p1.drawText(formData.i_cphone || '061-462-3588', { x: 385, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 40, 60, 20, COLOR_HEADER_BG);
  p1.drawText('소재지', { x: 115, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 40, tableW - 120, 20);
  p1.drawText(formData.i_caddr || '전남 영암군 삼호읍 대불로 93', { x: 165, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 60, 60, 20, COLOR_HEADER_BG);
  p1.drawText('성명', { x: 120, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 60, 160, 20);
  p1.drawText(formData.i_rep_name || '김삼춘', { x: 165, y: curY - 55, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 60, 60, 20, COLOR_HEADER_BG);
  p1.drawText('사업자번호', { x: 326, y: curY - 55, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 60, tableW - 340, 20);
  p1.drawText(formData.i_cregno || '847-81-03268', { x: 385, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  curY -= 60;

  // Employee block
  drawTableBox(p1, 40, curY - 40, 60, 40, COLOR_HEADER_BG);
  p1.drawText('근로자\nEmployee', { x: 48, y: curY - 25, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('성명', { x: 120, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 20, 160, 20);
  p1.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 165, y: curY - 15, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('생년월일', { x: 332, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 20, tableW - 340, 20);
  p1.drawText(formData.i_dob || '1988-05-19', { x: 385, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 40, 60, 20, COLOR_HEADER_BG);
  p1.drawText('본국주소', { x: 110, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 40, tableW - 120, 20);
  p1.drawText(formData.i_address_home || 'SIR DARYO VILOYATI, UZBEKISTAN', { x: 165, y: curY - 35, size: 7.5, font, color: COLOR_TEXT });
  curY -= 40;

  // Contract Terms
  const terms = [
    { no: '1. 근로계약기간\nTerm of Contract', text: `${ty}년 ${tm}월 ${td}일  ~  ${nextTy}년 ${tm}월 ${td}일 (24개월)\n※ (E-7-4 전환 요건) 계약기간이 최소 2년 이상이어야 함 / 요건 충족` },
    { no: '2. 근로장소\nPlace of Work', text: `${formData.i_caddr || '전남 영암군 삼호읍 대불로 93 (현대삼호중공업 內)'}` },
    { no: '3. 업무내용\nDescription', text: `업종: 제조업 / 사업내용: 선박구성부분품제조 / 직무내용: ${formData.i_job || '선박도장'}\n※ 외국인근로자가 사업장에서 수행할 구체적인 담당업무를 성실히 이행함` },
    { no: '4. 근로시간\nWorking Hours', text: '08:00 ~ 17:00 (1일 8시간, 주 40시간 기준)\n- 사업장 사정에 따라 연장·야간·휴일근로가 발생할 수 있음' },
    { no: '5. 휴게시간\nRecess Hours', text: '1일 80분 (80 minutes per day, 식사시간 포함)' },
    { no: '6. 휴일\nHolidays', text: '[ V ] 주휴일(일요일)    [ V ] 법정공휴일(유급)    [ V ] 매주 토요일(무급/취업규칙)' }
  ];

  terms.forEach(t => {
    drawTableBox(p1, 40, curY - 45, 110, 45, COLOR_HEADER_BG);
    p1.drawText(t.no, { x: 45, y: curY - 22, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(p1, 150, curY - 45, tableW - 110, 45);
    p1.drawText(t.text, { x: 160, y: curY - 20, size: 7.5, font, color: COLOR_TEXT });
    curY -= 45;
  });

  // Page 2
  const p2 = pdfDoc.addPage([595, 842]);
  p2.drawText('근로계약서 견본 / Labor Contract (뒤쪽/Page 2)', { x: 170, y: 800, size: 12, font, color: COLOR_TEXT });

  let curY2 = 770;
  const rawNum = parseInt((formData.i_income || '3240').replace(/[^0-9]/g, ''), 10) || 3240;
  const mVal = Math.round((rawNum * 10000) / 12).toLocaleString();

  const p2Terms = [
    { no: '7. 임금\nPayment', text: `1) 월 통상임금: ${mVal} 원\n   ※ (E-7-4 전환 요건) 연봉 2,600만원 이상(월 217만원 이상) 요건 충족\n2) 연장·야간·휴일근로에 대해서는 통상임금의 100분의 50 이상을 가산 지급` },
    { no: '8. 임금지급일\nPayment Date', text: '매월 10일 (다만, 지급일이 공휴일인 경우에는 전일에 지급함)' },
    { no: '9. 지급방법\nMethods', text: '[ V ] 근로자 명의의 예금통장 계좌로 전액 직접 입금 (Direct Deposit)' },
    { no: '10. 숙식제공\nAccomm & Meals', text: '1) 숙박시설 제공: [ V ] 제공 (기숙사/주택, 근로자 부담금액: 매월 100,000원)\n2) 식사 제공: [ V ] 제공 (중식 제공, 근로자 부담금액: 0원)' },
    { no: '11. 기타\nCompliance', text: '사용자와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 한다.\n본 계약서에 정하지 않은 사항은 근로기준법에 따른다.' }
  ];

  p2Terms.forEach(t => {
    drawTableBox(p2, 40, curY2 - 50, 110, 50, COLOR_HEADER_BG);
    p2.drawText(t.no, { x: 45, y: curY2 - 25, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(p2, 150, curY2 - 50, tableW - 110, 50);
    p2.drawText(t.text, { x: 160, y: curY2 - 22, size: 7.5, font, color: COLOR_TEXT });
    curY2 -= 50;
  });

  // Signatures
  p2.drawText(`${ty}년      ${tm}월      ${td}일`, { x: 380, y: curY2 - 40, size: 9, font, color: COLOR_TEXT });
  p2.drawText(`사용자(Employer):  ${formData.i_cname || '(유)가영테크'}  대표  ${formData.i_rep_name || '김삼춘'}  (서명/인)`, { x: 60, y: curY2 - 80, size: 8.5, font, color: COLOR_TEXT });
  drawStamp(p2, font, 480, curY2 - 80, formData.i_rep_name || '김삼춘');

  p2.drawText(`근로자(Employee):  ${fullName}  (서명 또는 인)`, { x: 60, y: curY2 - 120, size: 8.5, font, color: COLOR_TEXT });
}

// 6. 재직 (경력) 증명서 (출입국 제출용)
export async function renderEmploymentCert(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  // Document No
  page.drawText(`문서번호: GY-${ty}-61`, { x: 40, y: 800, size: 9, font, color: COLOR_MUTED });
  
  // Title
  page.drawText('재  직  (경  력)  증  명  서', { x: 175, y: 750, size: 17, font, color: COLOR_TEXT });

  let curY = 705;
  const tableW = 515;

  // 1. 인적사항
  page.drawText('• 인 적 사 항', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('성  명', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('직  위', { x: 310, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText('사  원', { x: 430, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('생년월일', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_dob || '1988년 05월 19일', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 290, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText(formData.i_arc || '880519-5600011', { x: 380, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('주  소', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText(formData.i_address_kr || '전라남도 영암군 삼호읍 신항로 120-28, 302호(신성빌)', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 36;

  // 2. 재직사항
  page.drawText('• 재 직 사 항', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('회 사 명', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_cname || '유한회사 가영테크', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 290, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 380, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('대 표 명', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_rep_name || '김삼춘', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('업  종', { x: 310, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText('선박구성부분품제조업', { x: 375, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('사업장 소재지', { x: 45, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText(formData.i_caddr || '전남 영암군 삼호읍 대불로 93, 현대삼호중공업 內', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('재직기간', { x: 58, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText('2025년 01월 23일  ~  현재 재직중', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 36;

  // 3. 발급내역
  page.drawText('• 발 급 내 역', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('담당부서', { x: 58, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText('관리부', { x: 170, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('담 당 자', { x: 305, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText('부장  백기철', { x: 400, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('용도 및 제출처', { x: 45, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText('출입국·외국인관서 제출용 (체류자격 변경 및 연장 신청)', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 50;

  // Closing
  page.drawText('상기와 같이 재직 및 경력사항을 증명함.', { x: 190, y: curY - 20, size: 11, font, color: COLOR_TEXT });
  page.drawText(`${ty}년      ${tm}월      ${td}일`, { x: 235, y: curY - 60, size: 10, font, color: COLOR_TEXT });
  page.drawText(`${formData.i_cname || '유한회사 가영테크'}    대 표   ${formData.i_rep_name || '김삼춘'}`, { x: 170, y: curY - 100, size: 12, font, color: COLOR_TEXT });
  drawStamp(page, font, 430, curY - 100, formData.i_rep_name || '김삼춘');
}
