import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function generateContentWithRetry(ai: any, params: any, maxRetries = 3): Promise<any> {
  let attempt = 0;
  let delay = 1000;
  
  // Try models in order of preference (Primary: gemini-2.5-flash for optimal price-performance & accurate OCR/verification)
  const models = [params.model || "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash"];

  for (const model of models) {
    attempt = 0;
    delay = 1000;
    while (attempt < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: model
        });
        return response;
      } catch (err: any) {
        attempt++;
        console.warn(`Gemini generation failed (model: ${model}, attempt: ${attempt}/${maxRetries}):`, err.message || err);
        
        // If it's the last attempt of this model, don't sleep, just continue to next model/throw
        if (attempt >= maxRetries) {
          if (model === models[models.length - 1]) {
            throw err;
          }
          break; // move to fallback model
        }

        // Wait before retrying with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
}

async function startServer() {
  const app = express();
  
  // AI Studio preview proxy strictly expects port 3000.
  // On external cloud platforms (like Render), use process.env.PORT provided by the platform.
  const isAiStudio = !!process.env.K_SERVICE;
  const PORT = (!isAiStudio && process.env.PORT) ? parseInt(process.env.PORT, 10) : 3000;

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("✅ Google Gemini AI 클라이언트가 성공적으로 초기화되었습니다.");
  } else {
    console.warn("⚠️ [안내] GEMINI_API_KEY 환경변수가 설정되지 않았습니다. AI OCR 및 서류 검증 기능을 사용하려면 Render 환경변수에 GEMINI_API_KEY를 등록해 주세요.");
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // AI OCR extraction endpoint
  app.post("/api/gemini/ocr", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ error: "Gemini AI가 초기화되지 않았습니다. Render 환경변수에 GEMINI_API_KEY를 등록해 주세요." });
      }
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mimeType" });
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: image,
              mimeType: mimeType
            }
          },
          {
            text: `당신은 출입국 비자 행정 및 신분증/공문서 전문 판독 AI입니다.
업로드된 대한민국 외국인등록증(앞/뒤), 여권, 외국인등록 사실증명, 사업자등록증, 표준근로계약서, 소득금액증명, 임대차계약서(거주확인서) 이미지 또는 PDF 내용을 정밀 분석하여 텍스트 정보를 추출하십시오.
반드시 정확한 대응 키값을 가지는 아래 JSON 양식에 맞춰 반환해 주십시오 (마크다운 백틱 없이 순수 JSON만 반환).

- 영문 성명은 성(i_surname)과 명(i_givenname)으로 대문자로 완벽히 분리하십시오.
- 날짜(생년월일, 발급일, 만료일, 입주일 등)는 "YYYY-MM-DD" 포맷으로 통일하십시오.
- 외국인등록번호(i_arc)는 13자리(하이픈 포함: "880519-5600011")로 작성하십시오.
- 대한민국 체류지 주소(i_address_kr) 및 회사 주소(i_caddr)는 도로명 주소와 상세주소(호수, 건물명)를 온전히 추출하십시오.
- 사업자등록번호(i_cregno)는 하이픈 포함("847-81-03268") 형식입니다.
- 연소득(i_income)은 만원 단위 숫자(예: 3240, 4588)로 기재하십시오.
- 해당 문서에 나타나지 않거나 판독할 수 없는 항목은 공백 문자("")로 두십시오.

{
  "i_surname": "영문 성 (예: MUKHTOROV)",
  "i_givenname": "영문 명 (예: NAJIBULLO IKROMOVICH)",
  "i_dob": "YYYY-MM-DD (예: 1988-05-19)",
  "i_gender": "M 또는 F",
  "i_nation": "국적 영문 대문자 (예: UZBEKISTAN, SRI LANKA, VIETNAM)",
  "i_arc": "외국인등록번호 (예: 880519-5600011)",
  "i_passport": "여권번호 (예: FA0616217)",
  "i_pass_issue": "YYYY-MM-DD",
  "i_pass_exp": "YYYY-MM-DD",
  "i_address_kr": "체류지 도로명 주소 (예: 전라남도 영암군 삼호읍 신항로 120-28, 302호)",
  "i_cellphone": "휴대전화번호 (예: 010-4832-8805)",
  "i_cname": "회사 상호 (예: 유한회사 가영테크)",
  "i_cregno": "사업자등록번호 (예: 847-81-03268)",
  "i_rep_name": "대표자 성명 (예: 김삼춘)",
  "i_rep_id": "대표자 식별번호 또는 생년월일 (예: 710403-1000000)",
  "i_caddr": "사업장 주소 (예: 전라남도 영암군 삼호읍 대불로 93)",
  "i_cphone": "회사 전화번호 (예: 061-462-3588)",
  "i_job": "직업/직종명 (예: 선박도장원, 선박용접원)",
  "i_job_code": "한국표준직업분류 코드 (예: 7832, 7431)",
  "i_income": "연소득 만원 단위 (예: 3240)",
  "i_dorm_start": "기숙사/숙소 입주일 YYYY-MM-DD",
  "visaType": "체류자격 (예: E-7-4R, E-7-3, E-9)"
}`
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini");
      }
      res.json(JSON.parse(text.trim()));
    } catch (err: any) {
      console.error("AI OCR Server Error:", err);
      res.status(500).json({ error: err.message || "Failed to perform OCR" });
    }
  });

  // AI Document Verification / Crosscheck endpoint
  app.post("/api/gemini/verify", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ error: "Gemini AI가 초기화되지 않았습니다. Render 환경변수에 GEMINI_API_KEY를 등록해 주세요." });
      }
      const { documents, formData, language } = req.body;
      if (!formData) {
        return res.status(400).json({ error: "Missing formData values" });
      }

      const prompt = `당신은 대한민국 법무부 출입국·외국인정책본부 및 지자체 비자 심사 전문가(Vision AI)입니다.
업로드된 증빙 서류(외국인등록증, 여권, 사업자등록증, 표준근로계약서, 소득금액증명원, 4대보험 가입자명부, 국세/지방세 납세증명서, 지자체 추천서, 사회통합프로그램 이수증 등)와 [신청서 입력 데이터]를 정밀 대조하여 교차 검증하십시오.

[정밀 대조 및 비자 규정 검증 지침]
1. 인적사항 대조: 성명 철자(성/명 분리), 생년월일, 등록번호(13자리), 여권번호, 유효기간 도래 여부, 체류지 주소를 일치 대조하십시오.
2. 사업장 정보 대조: 사업자등록번호(10자리), 상호명, 대표자 성명, 대표자 식별번호(생년월일), 회사 주소, 전화번호를 대조하십시오.
3. E-7-4R (지역특화 숙련기능) & E-7-3 조선업 특화 규정 심사:
   - 근로계약기간: E-7-4 전환 요건상 계약기간이 최소 2년(24개월) 이상이어야 합니다.
   - 통상임금 및 연소득 요건: 연간 2,600만원 이상 (월 통상임금 217만원 이상, 보통 월 270만원 이상) 충족 여부를 확인하십시오.
   - 체납 여부: 국세 및 지방세 납세증명서 상 '체납 없음(해당사항 없음)'이어야 합니다. 체납 내역 발견 시 경고하십시오.
   - 체류지 및 근무지: 인구감소지역(영암군 등) 관할 여부를 확인하십시오.
4. 오류 검출 시 'fieldId' 매핑:
   - i_surname, i_givenname, i_dob, i_arc, i_passport, i_address_kr, i_cname, i_cregno, i_rep_name, i_rep_id, i_caddr, i_cphone, i_income, i_dorm_start, visaType
5. 설명('description') 및 권장조치('recommendation')는 사용자가 요청한 언어[${language || 'Korean'}]로 명확하고 전문적으로 작성하십시오.

[신청서 입력 데이터]
${JSON.stringify(formData, null, 2)}

반드시 responseSchema 데이터 구조에 완벽히 상호 호환되는 형식으로 JSON만 반환해주십시오.`;

      const contents: any[] = [{ text: prompt }];

      if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
          if (doc && doc.data && doc.mimeType) {
            contents.push({
              inlineData: {
                data: doc.data,
                mimeType: doc.mimeType
              }
            });
          }
        }
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { 
                type: Type.STRING,
                description: "PASS (일치) or FAIL (불일치/경고)"
              },
              issues: {
                type: Type.ARRAY,
                description: "검출된 각 불일치 내역 정보 리스트",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldId: { 
                      type: Type.STRING,
                      description: "오류가 발견된 화면의 입력 필드 ID (예: i_surname, i_givenname, i_dob, i_arc, i_passport, i_cregno, i_income). 없을 경우 빈칸" 
                    },
                    category: { 
                      type: Type.STRING,
                      description: "불일치 대분류 항목"
                    },
                    description: { 
                      type: Type.STRING,
                      description: "검출 원인 설명"
                    },
                    recommendation: { 
                      type: Type.STRING,
                      description: "올바른 형태로 조치 및 수정해야 할 가이드라인"
                    }
                  },
                  required: ["fieldId", "category", "description", "recommendation"]
                }
              }
            },
            required: ["status", "issues"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response returned from Gemini validation model");
      }
      res.json(JSON.parse(text.trim()));
    } catch (err: any) {
      console.error("AI Verify Server Error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze document verification" });
    }
  });

  // Explicitly return 404 for missing PDF templates instead of falling back to SPA index.html
  app.get("/templates/*.pdf", (req, res, next) => {
    const templatePath = path.join(process.cwd(), "public", req.path);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template PDF not found" });
    }
    next();
  });

  // Serve static files / Vite client in production / dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
