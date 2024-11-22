export interface Notification {
  buyer_id: string | null;
  created_at: string | null;
  expiry_at: string | null;
  id: string;
  seller_id: string | null;
  is_read: boolean | null;
  buyer_name?: string;
}
