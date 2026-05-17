"use client";

import { useActionState, useEffect, useState } from "react";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { submitReviewAction, type ReviewState } from "./actions";

const ratingLabels: { [key: number]: string } = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function ReviewForm({ ticketId }: { ticketId: string }) {
  const action = submitReviewAction.bind(null, ticketId);
  const [state, formAction, pending] = useActionState(action, undefined);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [wasEstimateAccurate, setWasEstimateAccurate] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Read local storage to see if this ticket was already reviewed in this browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isReviewed = localStorage.getItem(`reviewed_ticket_${ticketId}`);
      if (isReviewed) {
        setSubmitted(true);
      }
    }
  }, [ticketId]);

  // Handle successful submission
  useEffect(() => {
    if (state?.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`reviewed_ticket_${ticketId}`, "true");
      }
      setSubmitted(true);
    }
  }, [state, ticketId]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-emerald-950">Thank you for your feedback!</h3>
        <p className="text-sm text-emerald-800 max-w-sm">
          Your review has been submitted successfully. We appreciate you taking the time to share your experience.
        </p>
      </div>
    );
  }

  const isFormValid = rating > 0 && wasEstimateAccurate !== null;

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <h3 className="text-lg font-bold tracking-tight text-foreground">How was your visit?</h3>
      <p className="text-sm text-muted mb-6">We value your opinion! Please take a moment to rate us.</p>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Hidden inputs to capture state in FormData */}
        <input type="hidden" name="rating" value={rating || ""} />
        <input type="hidden" name="was_estimate_accurate" value={wasEstimateAccurate === null ? "" : String(wasEstimateAccurate)} />

        {/* Star Rating Section */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200 fill-zinc-50"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {rating > 0 || hoverRating > 0 ? (
            <span className="text-sm font-semibold text-amber-600 animate-in fade-in duration-200">
              {ratingLabels[hoverRating || rating]}
            </span>
          ) : (
            <span className="text-sm text-muted">Select your rating</span>
          )}
        </div>

        {/* Estimate Accuracy Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Was the wait time estimate accurate?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setWasEstimateAccurate(true)}
              className={`flex-1 py-3 px-4 rounded-2xl border text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                wasEstimateAccurate === true
                  ? "border-accent bg-accent/5 text-accent shadow-sm"
                  : "border-border bg-background text-foreground hover:bg-surface"
              }`}
            >
              Yes, accurate
            </button>
            <button
              type="button"
              onClick={() => setWasEstimateAccurate(false)}
              className={`flex-1 py-3 px-4 rounded-2xl border text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                wasEstimateAccurate === false
                  ? "border-accent bg-accent/5 text-accent shadow-sm"
                  : "border-border bg-background text-foreground hover:bg-surface"
              }`}
            >
              No, inaccurate
            </button>
          </div>
        </div>

        {/* Optional Comments Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="comment" className="text-sm font-medium text-foreground">
              Optional Comment
            </label>
            <span className="text-xs text-muted">
              {comment.length} / 500
            </span>
          </div>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition-colors"
          />
        </div>

        {state?.error ? (
          <p className="text-sm text-danger font-medium animate-in fade-in" role="alert">
            {state.error}
          </p>
        ) : null}

        {/* Form Action Buttons */}
        <button
          type="submit"
          disabled={!isFormValid || pending}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-medium text-accent-foreground shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent transition-colors"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting review...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
}
