export const createPingPayload = ({
  buyer_id,
  buyer_name,
  user_id,
}: {
  buyer_id: string;
  buyer_name: string;
  user_id: string;
}) => {
  return {
    id: `${buyer_id}-${Date.now()}`,
    buyer_id: buyer_id,
    buyer_name: buyer_name,
    seller_id: user_id,
    is_read: false,
    created_at: new Date().toISOString(),
    expiry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
};
