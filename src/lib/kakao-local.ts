import type { KakaoKeywordSearchResponse, KakaoSearchParams } from "@/types/kakao";

const API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
const KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

export class KakaoApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "KakaoApiError";
    this.status = status;
  }
}

export class KakaoConfigError extends Error {
  constructor(message = "NEXT_PUBLIC_KAKAO_REST_API_KEY is not set") {
    super(message);
    this.name = "KakaoConfigError";
  }
}

// Kakao's category_group_code enum is coarse: only FD6 (음식점) and CE7 (카페)
// map to restaurant/cafe categories. Finer categories like 한식/고깃집 are only
// reachable via free-text `query`, not a code — there is no "한식" code.
export const CATEGORY_GROUPS = [
  { label: "전체", code: undefined },
  { label: "음식점", code: "FD6" },
  { label: "카페", code: "CE7" },
] as const;

export async function searchKeyword(
  params: KakaoSearchParams,
  signal?: AbortSignal
): Promise<KakaoKeywordSearchResponse> {
  if (!API_KEY) {
    throw new KakaoConfigError();
  }

  const searchParams = new URLSearchParams();
  searchParams.set("query", params.query);
  if (params.category_group_code) {
    searchParams.set("category_group_code", params.category_group_code);
  }
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.size !== undefined) {
    searchParams.set("size", String(params.size));
  }
  if (params.x !== undefined) {
    searchParams.set("x", params.x);
  }
  if (params.y !== undefined) {
    searchParams.set("y", params.y);
  }
  if (params.radius !== undefined) {
    searchParams.set("radius", String(params.radius));
  }

  const response = await fetch(`${KEYWORD_SEARCH_URL}?${searchParams.toString()}`, {
    headers: {
      Authorization: `KakaoAK ${API_KEY}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new KakaoApiError(response.status, `Kakao API request failed with status ${response.status}`);
  }

  return (await response.json()) as KakaoKeywordSearchResponse;
}
