// Server-only client for the Gemini API. Never import this from a "use client"
// component — GEMINI_API_KEY has no NEXT_PUBLIC_ prefix on purpose.
import type { ReviewAnalysis } from "@/types/review-analysis";

const API_KEY = process.env.GEMINI_API_KEY;
// gemini-2.5-flash was retired for new users; the API's own error message
// points new callers at this replacement.
const MODEL = "gemini-3.6-flash";
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class GeminiApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

export class GeminiConfigError extends Error {
  constructor(message = "GEMINI_API_KEY is not set") {
    super(message);
    this.name = "GeminiConfigError";
  }
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    sentiment: {
      type: "object",
      properties: {
        positive: { type: "integer" },
        neutral: { type: "integer" },
        negative: { type: "integer" },
      },
      required: ["positive", "neutral", "negative"],
    },
    keywords: {
      type: "array",
      minItems: 8,
      maxItems: 15,
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          score: { type: "integer" },
          context: { type: "string", enum: ["positive", "negative"] },
        },
        required: ["word", "score", "context"],
      },
    },
    summary: { type: "string" },
  },
  required: ["sentiment", "keywords", "summary"],
};

function buildPrompt(placeName: string, reviews: { rating: number; text: string }[], lang: "ko" | "en"): string {
  const reviewList = reviews
    .map((review, index) => `${index + 1}. [${review.rating}점] ${review.text || "(내용 없음)"}`)
    .join("\n");

  // The reviews themselves are already in `lang` by the time they get here
  // (fetched via getPlaceReviewDetails(placeId, lang)), so only the output
  // instruction needs to change — Gemini naturally continues in English
  // once it's reading English review text anyway.
  const outputLanguageInstruction =
    lang === "en"
      ? "summary와 keywords의 word는 영어로 작성하세요."
      : "summary와 keywords의 word는 한국어로 작성하세요.";

  return `당신은 음식점 리뷰 분석가입니다. 아래는 '${placeName}'에 대한 구글 리뷰 ${reviews.length}개입니다.

리뷰 목록:
${reviewList}

다음 3가지 작업을 수행해 JSON으로만 답하세요:
1. 각 리뷰를 긍정/보통/부정으로 분류하고 개수를 세세요. 리뷰 본문의 어조와 별점을 함께 근거로 사용하세요. positive+neutral+negative의 합은 반드시 ${reviews.length}여야 합니다.
2. 리뷰에 자주 나오는 핵심 단어를 8~15개 뽑으세요. 음식 이름, 맛, 분위기, 서비스 위주로 고르고, 각 단어가 리뷰에서 얼마나 중요하게 언급되는지 1~10점으로 매기고, 그 단어가 주로 긍정적 맥락인지 부정적 맥락인지 표시하세요.
3. 이 가게에 대한 리뷰 전체를 한 문장으로 요약하세요.
${outputLanguageInstruction}`;
}

export async function analyzeReviews(
  placeName: string,
  reviews: { rating: number; text: string }[],
  lang: "ko" | "en"
): Promise<ReviewAnalysis> {
  if (!API_KEY) {
    throw new GeminiConfigError();
  }

  const response = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(placeName, reviews, lang) }] }],
      generationConfig: {
        // This extraction task doesn't need deep reasoning — LOW keeps
        // latency/token usage down (no thinking tokens) without hurting
        // the structured output quality, verified against the live API.
        thinkingConfig: { thinkingLevel: "LOW" },
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    throw new GeminiApiError(response.status, `Gemini API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new GeminiApiError(502, "Gemini API returned no content");
  }

  const parsed = JSON.parse(raw) as Partial<ReviewAnalysis>;

  return {
    sentiment: {
      positive: parsed.sentiment?.positive ?? 0,
      neutral: parsed.sentiment?.neutral ?? 0,
      negative: parsed.sentiment?.negative ?? 0,
    },
    keywords: parsed.keywords ?? [],
    summary: parsed.summary ?? "",
  };
}
