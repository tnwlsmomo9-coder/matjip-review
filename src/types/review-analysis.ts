export interface ReviewSentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ReviewKeyword {
  word: string;
  score: number;
  context: "positive" | "negative";
}

export interface ReviewAnalysis {
  sentiment: ReviewSentimentCounts;
  keywords: ReviewKeyword[];
  summary: string;
}
