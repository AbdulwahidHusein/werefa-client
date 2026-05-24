/** Queue customer directory + governance (hand-written until OpenAPI regen). */

export type ProviderCustomer = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  is_banned: boolean;
  ticket_count: number;
  last_joined_at: string | null;
  has_active_ticket: boolean;
};

export type ProviderCustomersResponse = {
  data: ProviderCustomer[];
  count: number;
};

export type QueueTicketExtra = {
  guest_phone?: string | null;
  guest_email?: string | null;
  user_full_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
  is_banned?: boolean;
  approved_at?: string | null;
};

export function ticketDisplayName(
  t: { guest_name?: string | null; user_full_name?: string | null; ticket_number: number },
): string {
  return (
    t.guest_name?.trim() ||
    t.user_full_name?.trim() ||
    `Customer #${t.ticket_number}`
  );
}

export function ticketContactLines(
  t: QueueTicketExtra,
): { email: string | null; phone: string | null } {
  return {
    email: t.guest_email?.trim() || t.user_email?.trim() || null,
    phone: t.guest_phone?.trim() || t.user_phone?.trim() || null,
  };
}
