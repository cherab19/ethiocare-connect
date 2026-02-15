import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout, { getFamilyNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Syringe, Shield, Heart, Clock } from "lucide-react";

export default function FamilyDashboard() {
  const { t } = useLanguage();
  const { tenantId } = useAuth();

  const { data: members = [] } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("family_members").select("*").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["upcoming_appointments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("appointments")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .gte("appointment_date", new Date().toISOString())
        .order("appointment_date")
        .limit(5);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["due_vaccinations", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("vaccinations")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .eq("status", "scheduled")
        .order("scheduled_date")
        .limit(5);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: records = [] } = useQuery({
    queryKey: ["recent_records", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("medical_records")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!tenantId,
  });

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.dashboard}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t.family.members} value={members.length} icon={<Users className="h-4 w-4" />} />
          <StatCard title={t.family.upcomingAppointments} value={appointments.length} icon={<Calendar className="h-4 w-4" />} />
          <StatCard title={t.family.vaccinationsDue} value={vaccinations.length} icon={<Syringe className="h-4 w-4" />} />
          <StatCard title={t.family.emergencyCard} value={members.length > 0 ? "Active" : "—"} icon={<Shield className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-accent" />{t.family.recentRecords}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No records yet</p>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{(record as any).family_members?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{record.record_type}: {record.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-accent" />{t.family.upcomingAppointments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{(apt as any).family_members?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{apt.reason || "Appointment"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                        <span className="inline-block rounded-full bg-emerald-muted px-2 py-0.5 text-xs font-medium text-primary">{apt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
