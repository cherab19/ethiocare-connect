import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getHospitalNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  requested: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-emerald-muted text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function HospitalAppointments() {
  const { t } = useLanguage();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["hospital_appointments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, family_members(full_name)")
        .eq("hospital_tenant_id", tenantId)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital_appointments"] });
      toast({ title: "Appointment updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout navItems={getHospitalNav(t)} title={t.hospital.appointments}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{appointments.length} appointments</p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : appointments.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No appointments scheduled for this hospital.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <Card key={apt.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{(apt as any).family_members?.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(apt.appointment_date).toLocaleString()}
                    </div>
                    {apt.reason && <p className="text-sm text-muted-foreground">{apt.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[apt.status] || ""}>{apt.status}</Badge>
                    {apt.status === "requested" && (
                      <div className="flex gap-1">
                        <Button size="sm" className="gap-1" onClick={() => updateStatus.mutate({ id: apt.id, status: "confirmed" })}>
                          <CheckCircle className="h-3 w-3" /> Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {apt.status === "confirmed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}>
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
