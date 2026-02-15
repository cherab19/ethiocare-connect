import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, FileText, Syringe, BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [profiles, tenants, appointments, records, vaccinations] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tenants").select("id, type", { count: "exact" }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("medical_records").select("id", { count: "exact", head: true }),
        supabase.from("vaccinations").select("id", { count: "exact", head: true }),
      ]);

      const familyCount = (tenants.data || []).filter((t) => t.type === "family").length;
      const hospitalCount = (tenants.data || []).filter((t) => t.type === "hospital").length;

      return {
        users: profiles.count || 0,
        families: familyCount,
        hospitals: hospitalCount,
        appointments: appointments.count || 0,
        records: records.count || 0,
        vaccinations: vaccinations.count || 0,
      };
    },
  });

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.analytics}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title={t.admin.totalUsers} value={stats?.users ?? "—"} icon={<Users className="h-4 w-4" />} />
          <StatCard title={t.admin.totalFamilies} value={stats?.families ?? "—"} icon={<Users className="h-4 w-4" />} />
          <StatCard title={t.admin.totalHospitals} value={stats?.hospitals ?? "—"} icon={<Building2 className="h-4 w-4" />} />
          <StatCard title="Total Appointments" value={stats?.appointments ?? "—"} icon={<Calendar className="h-4 w-4" />} />
          <StatCard title="Medical Records" value={stats?.records ?? "—"} icon={<FileText className="h-4 w-4" />} />
          <StatCard title="Vaccinations" value={stats?.vaccinations ?? "—"} icon={<Syringe className="h-4 w-4" />} />
        </div>

        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-accent" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time analytics are pulled from the database. As the platform grows, charts and trend data will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
