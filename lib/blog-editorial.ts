export const editorialStandardVersion = "1.0";

export type EditorialStatus = "draft" | "in_review" | "approved" | "rejected";

export type EditorialReview = {
  status: EditorialStatus;
  standardVersion: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
};

export type ReviewedCandidate<T> = {
  post: T;
  review: EditorialReview;
};

function isApproved(review: EditorialReview) {
  return review.status === "approved"
    && review.standardVersion === editorialStandardVersion
    && Boolean(review.reviewedAt)
    && Boolean(review.reviewer)
    && Boolean(review.notes);
}

export function approvedEditorialPosts<T>(candidates: ReviewedCandidate<T>[]) {
  return candidates.filter(({ review }) => isApproved(review)).map(({ post }) => post);
}
