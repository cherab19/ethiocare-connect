import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const { tenantId, user } = useAuth();
  const { toast } = useToast();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!tenantId || !user || subscribedRef.current) return;
    subscribedRef.current = true;

    const channel = supabase
      .channel(`tenant-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          // Don't notify about own actions
          if (payload.new.created_by === user.id) return;
          toast({
            title: "📅 New Appointment",
            description: `An appointment has been scheduled for ${new Date(payload.new.appointment_date).toLocaleDateString()}.`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "medical_records", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.new.created_by === user.id) return;
          toast({
            title: "📋 New Medical Record",
            description: `A new record "${payload.new.title}" has been added.`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "medical_records", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          toast({
            title: "📋 Record Updated",
            description: `The record "${payload.new.title}" has been updated.`,
          });
        }
      )
      .subscribe();

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [tenantId, user, toast]);
}
