import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { ReviewsList, type Review } from "@/components/ReviewsList";

type ProviderPublic = components["schemas"]["ProviderPublic"];

export default async function ProviderReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  let provider: ProviderPublic;
  try {
    provider = await apiFetch<ProviderPublic>(
      `/providers/by-slug/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }

  let reviews: { data: Review[]; count: number } = { data: [], count: 0 };
  try {
    reviews = await apiFetch(
      `/providers/${provider.id}/reviews?limit=${limit}&offset=${offset}`,
      { method: "GET" },
    );
  } catch (err) {
    // If not found or error
    if (err instanceof ApiRequestError && err.status === 404) {
      reviews = { data: [], count: 0 };
    } else {
      throw err;
    }
  }

  const totalPages = Math.ceil(reviews.count / limit);

  return (
    <AppShell>
      <PageHeader
        title={`${provider.biz_name} Reviews`}
        subtitle={`${reviews.count} total reviews`}
        back={`/p/${provider.slug}`}
      />

      <section className="mt-4">
        <ReviewsList reviews={reviews.data} />
        
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 ? (
              <a
                href={`/p/${provider.slug}/reviews?page=${page - 1}`}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent/5"
              >
                Previous
              </a>
            ) : null}
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <a
                href={`/p/${provider.slug}/reviews?page=${page + 1}`}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent/5"
              >
                Next
              </a>
            ) : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}
