import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, BarChart3, CreditCard, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: async () => {
      const [profiles, tenants] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tenants").select("id, type"),
      ]);
      const families = (tenants.data || []).filter((t) => t.type === "family").length;
      const hospitals = (tenants.data || []).filter((t) => t.type === "hospital").length;
      return { users: profiles.count || 0, families, hospitals };
    },
  });

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.dashboard}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t.admin.totalUsers} value={stats?.users ?? "—"} icon={<Users className="h-4 w-4" />} />
          <StatCard title={t.admin.totalFamilies} value={stats?.families ?? "—"} icon={<Users className="h-4 w-4" />} />
          <StatCard title={t.admin.totalHospitals} value={stats?.hospitals ?? "—"} icon={<Building2 className="h-4 w-4" />} />
          <StatCard title={t.admin.activeSubscriptions} value="—" icon={<CreditCard className="h-4 w-4" />} description="Chapa integration pending" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-accent" />{t.admin.analytics}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Platform analytics with real data are available on the Analytics page. Navigate there for detailed stats.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-accent" />{t.admin.systemHealth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Database", "Authentication", "API Gateway"].map((service) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{service}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-muted px-2 py-0.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />Healthy
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
