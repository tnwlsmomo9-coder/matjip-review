// Types for the Kakao Local API (keyword search).
// Field types follow Kakao's actual REST API response, which returns most
// numeric-looking values (ids, coordinates, distance) as strings.
// https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword

export interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

export interface KakaoMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

export interface KakaoKeywordSearchResponse {
  documents: KakaoPlaceDocument[];
  meta: KakaoMeta;
}

export interface KakaoSearchParams {
  query: string;
  category_group_code?: string;
  page?: number;
  size?: number;
  x?: string;
  y?: string;
  radius?: number;
  sort?: "distance" | "accuracy";
}

export interface KakaoCategorySearchParams {
  category_group_code: string;
  x: string;
  y: string;
  radius?: number;
  sort?: "distance" | "accuracy";
  page?: number;
  size?: number;
}
