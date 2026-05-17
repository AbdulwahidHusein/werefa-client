"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { requireMe } from "@/lib/dal";

export type ReviewState = { error?: string; success?: boolean } | undefined;

export async function submitReviewAction(
  ticketId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  await requireMe();

  const ratingStr = formData.get("rating");
  const wasEstimateAccurateStr = formData.get("was_estimate_accurate");
  const commentStr = formData.get("comment");

  if (!ratingStr) {
    return { error: "Rating is required." };
  }

  const rating = parseInt(String(ratingStr), 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  if (!wasEstimateAccurateStr) {
    return { error: "Wait time estimate accuracy is required." };
  }
  const was_estimate_accurate = wasEstimateAccurateStr === "true";

  const comment = commentStr ? String(commentStr).trim() : "";
  const finalComment = comment === "" ? null : comment;

  if (finalComment && finalComment.length > 500) {
    return { error: "Comment cannot exceed 500 characters." };
  }

  try {
    await apiFetch(`/tickets/${ticketId}/reviews`, {
      method: "POST",
      body: {
        rating,
        was_estimate_accurate,
        comment: finalComment,
      },
    });

    revalidatePath(`/me/tickets/${ticketId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      // 409 Conflict check
      if (err.status === 409) {
        return { error: "You have already submitted a review for this ticket." };
      }
      return { error: err.detail || "Failed to submit review." };
    }
    return { error: "An unexpected error occurred. Please try again." };
  }
}
