import Link from "next/link";

type JoinErrorAlertProps = {
  message: string;
};

export function JoinErrorAlert({ message }: JoinErrorAlertProps) {
  const showTicketsLink = message.toLowerCase().includes("active ticket");

  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-950"
    >
      <p className="font-medium leading-snug">{message}</p>
      {showTicketsLink ? (
        <Link
          href="/me/tickets"
          className="mt-2 inline-block text-sm font-medium text-rose-900 underline underline-offset-2"
        >
          View your active ticket
        </Link>
      ) : null}
    </div>
  );
}
