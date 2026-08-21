import type {
  KakaoCategorySearchParams,
  KakaoKeywordSearchResponse,
  KakaoPlaceDocument,
  KakaoSearchParams,
} from "@/types/kakao";

const API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
const KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const CATEGORY_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/category.json";

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

// Kakao's category_group_code enum is coarse — it only has FD6 (음식점) and
// CE7 (카페), with no code for cuisine types like 한식/중식. Those only show
// up as the second segment of `category_name` (e.g. "음식점 > 한식 > 한정식"),
// so cuisine filtering has to happen client-side after fetching FD6 results.
export type CategoryFilterValue = "all" | "한식" | "중식" | "일식" | "양식" | "기타음식점" | "카페";

export const CATEGORY_GROUPS: { label: string; value: CategoryFilterValue }[] = [
  { label: "전체", value: "all" },
  { label: "한식", value: "한식" },
  { label: "중식", value: "중식" },
  { label: "일식", value: "일식" },
  { label: "양식", value: "양식" },
  { label: "그외", value: "기타음식점" },
  { label: "카페", value: "카페" },
];

const CUISINE_LABELS = new Set(["한식", "중식", "일식", "양식"]);

function cuisineOf(doc: KakaoPlaceDocument): string {
  const mid = doc.category_name.split(" > ")[1]?.trim();
  return mid && CUISINE_LABELS.has(mid) ? mid : "기타음식점";
}

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
  if (params.sort) {
    searchParams.set("sort", params.sort);
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

// Kakao's category_group_code enum only has FD6 (음식점) and CE7 (카페) for
// food-related places. When a search isn't restricted to one of those (e.g.
// the "전체" chip), Kakao still returns unrelated place types matching the
// keyword, so results are filtered down to just restaurants/cafes here.
const RESTAURANT_OR_CAFE_CODES = new Set(["FD6", "CE7"]);

function isRestaurantOrCafe(doc: KakaoPlaceDocument): boolean {
  return RESTAURANT_OR_CAFE_CODES.has(doc.category_group_code);
}

// Kakao hard-caps every query (keyword or category) at 45 retrievable
// documents total, regardless of how many actually match (`total_count` can
// be in the tens of thousands — `pageable_count` is what's really reachable
// via paging, and it tops out at 45). Verified directly against the live API.
// So rather than paginate network calls on every "다음 페이지" click, we fetch
// the full (already-capped) result set once per search and paginate 30-at-a-
// time on the client — it's a handful of requests either way, and flipping
// pages afterward is instant.
const KAKAO_PAGE_SIZE = 15;
const KAKAO_MAX_PAGES = 3; // 45 / 15

async function fetchAll(
  fetchKakaoPage: (page: number) => Promise<KakaoKeywordSearchResponse>
): Promise<KakaoPlaceDocument[]> {
  const collected: KakaoPlaceDocument[] = [];
  let page = 1;
  while (page <= KAKAO_MAX_PAGES) {
    const response = await fetchKakaoPage(page);
    collected.push(...response.documents.filter(isRestaurantOrCafe));
    if (response.meta.is_end) break;
    page += 1;
  }
  return collected;
}

// Keyword search restricted to restaurants/cafes, fetching every reachable
// result (up to Kakao's 45-document cap for this single query).
export async function searchKeywordAll(
  params: Omit<KakaoSearchParams, "page" | "size">,
  signal?: AbortSignal
): Promise<KakaoPlaceDocument[]> {
  return fetchAll((page) => searchKeyword({ ...params, page, size: KAKAO_PAGE_SIZE }, signal));
}

// A single keyword query with no category filter still only returns up to 45
// raw documents (of any place type), so restricting to restaurants/cafes
// client-side can leave far fewer than 45. Running the FD6 (음식점) and CE7
// (카페) queries in parallel instead means each gets its own independent
// 45-document cap — up to 90 combined — with no filtering loss either way.
export async function searchRestaurantsAndCafes(
  params: Omit<KakaoSearchParams, "page" | "size" | "category_group_code">,
  signal?: AbortSignal
): Promise<KakaoPlaceDocument[]> {
  const [restaurants, cafes] = await Promise.all([
    searchKeywordAll({ ...params, category_group_code: "FD6" }, signal),
    searchKeywordAll({ ...params, category_group_code: "CE7" }, signal),
  ]);
  const combined = [...restaurants, ...cafes];
  if (params.sort !== "distance") {
    return combined;
  }
  return combined.sort((a, b) => Number(a.distance) - Number(b.distance));
}

// Single entry point for the category chip filter: "all" combines
// restaurants+cafes (up to 90), "카페" is a plain CE7 query, and each cuisine
// value fetches all FD6 (음식점) results once and narrows to that cuisine
// client-side, since Kakao has no cuisine-level category code to filter by.
export async function searchByFilter(
  params: Omit<KakaoSearchParams, "page" | "size" | "category_group_code">,
  filter: CategoryFilterValue,
  signal?: AbortSignal
): Promise<KakaoPlaceDocument[]> {
  if (filter === "all") {
    return searchRestaurantsAndCafes(params, signal);
  }
  if (filter === "카페") {
    return searchKeywordAll({ ...params, category_group_code: "CE7" }, signal);
  }
  const documents = await searchKeywordAll({ ...params, category_group_code: "FD6" }, signal);
  return documents.filter((doc) => cuisineOf(doc) === filter);
}

// Category-based search near a given coordinate, sorted by distance by default.
// Used for the "내 주변 맛집 탐색하기" flow: no keyword needed, just FD6 (음식점)
// around the user's actual geolocation. Radius defaults to Kakao's max (20km) so
// "지역에 있는 음식점" coverage isn't artificially narrowed.
export async function searchCategory(
  params: KakaoCategorySearchParams,
  signal?: AbortSignal
): Promise<KakaoKeywordSearchResponse> {
  if (!API_KEY) {
    throw new KakaoConfigError();
  }

  const searchParams = new URLSearchParams();
  searchParams.set("category_group_code", params.category_group_code);
  searchParams.set("x", params.x);
  searchParams.set("y", params.y);
  searchParams.set("radius", String(params.radius ?? 20000));
  searchParams.set("sort", params.sort ?? "distance");
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.size !== undefined) {
    searchParams.set("size", String(params.size));
  }

  const response = await fetch(`${CATEGORY_SEARCH_URL}?${searchParams.toString()}`, {
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

// Category search restricted to restaurants/cafes, fetching every reachable
// result (up to Kakao's 45-document cap for this single query).
export async function searchCategoryAll(
  params: Omit<KakaoCategorySearchParams, "page" | "size">,
  signal?: AbortSignal
): Promise<KakaoPlaceDocument[]> {
  return fetchAll((page) => searchCategory({ ...params, page, size: KAKAO_PAGE_SIZE }, signal));
}
