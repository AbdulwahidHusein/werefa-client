"use client";

import { Star, MessageSquareOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type Review = {
  id: string;
  rating: number;
  was_estimate_accurate: boolean;
  comment?: string | null;
  created_at?: string | null;
};

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-accent/5 rounded-2xl border border-dashed border-border">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 mb-3">
          <MessageSquareOff className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No reviews yet</h3>
        <p className="text-xs text-muted mt-1 max-w-[250px]">
          This provider hasn't received any written reviews from customers yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="p-5 rounded-2xl border border-border bg-background shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted/20 text-muted/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{review.rating}.0</span>
            </div>
            {review.created_at && (
              <span className="text-xs text-muted">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            )}
          </div>
          
          <div className="text-sm text-foreground/90 leading-relaxed break-words">
            {review.comment ? (
              <p>{review.comment}</p>
            ) : (
              <p className="italic text-muted">No comment provided.</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Anonymous Customer</span>
            <span className="text-xs text-muted">
              Estimate was {review.was_estimate_accurate ? "accurate" : "inaccurate"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
