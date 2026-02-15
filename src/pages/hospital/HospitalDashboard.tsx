import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout, { getHospitalNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Clock, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HospitalDashboard() {
  const { t } = useLanguage();
  const { tenantId } = useAuth();

  const { data: accessRequests = [] } = useQuery({
    queryKey: ["hospital_access_requests", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("access_requests").select("*").eq("target_tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["hospital_today_apts", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("appointments")
        .select("*, family_members(full_name)")
        .eq("hospital_tenant_id", tenantId)
        .gte("appointment_date", today)
        .order("appointment_date")
        .limit(10);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: records = [] } = useQuery({
    queryKey: ["hospital_records_count", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("medical_records").select("id").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const pendingCount = accessRequests.filter((r) => r.status === "pending").length;
  const approvedCount = accessRequests.filter((r) => r.status === "approved").length;

  return (
    <DashboardLayout navItems={getHospitalNav(t)} title={t.hospital.dashboard}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t.hospital.patients} value={approvedCount} icon={<Users className="h-4 w-4" />} description="Linked patients" />
          <StatCard title={t.hospital.todayAppointments} value={appointments.length} icon={<Calendar className="h-4 w-4" />} />
          <StatCard title={t.hospital.pendingRequests} value={pendingCount} icon={<FileText className="h-4 w-4" />} />
          <StatCard title="Medical Records" value={records.length} icon={<FileText className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-accent" />{t.hospital.todayAppointments}
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
                        <p className="text-xs text-muted-foreground">{new Date(apt.appointment_date).toLocaleString()}</p>
                      </div>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-accent" />{t.hospital.pendingRequests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingCount === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {accessRequests.filter((r) => r.status === "pending").slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Access Request</p>
                        <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary">pending</Badge>
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
