import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  id: string;
  tenant_id: string;
  plan: string;
  status: string;
  chapa_tx_ref: string | null;
  amount: number | null;
  currency: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { tenantId } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await (supabase as any)
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!tenantId,
  });

  const isActive = !!subscription?.expires_at && new Date(subscription.expires_at) > new Date();

  const initCheckout = async (plan: string, amount: number, returnUrl: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await supabase.functions.invoke("chapa-checkout", {
      body: { plan, amount, return_url: returnUrl },
    });

    if (res.error) throw new Error(res.error.message);
    return res.data as { checkout_url: string; tx_ref: string };
  };

  return { subscription, isActive, isLoading, initCheckout };
}
