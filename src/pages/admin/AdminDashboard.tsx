import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, BarChart3, CreditCard, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.dashboard}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t.admin.totalUsers} value="1,248" icon={<Users className="h-4 w-4" />} description="+34 this month" />
          <StatCard title={t.admin.totalFamilies} value="312" icon={<Users className="h-4 w-4" />} description="+8 this week" />
          <StatCard title={t.admin.totalHospitals} value="24" icon={<Building2 className="h-4 w-4" />} description="18 verified" />
          <StatCard title={t.admin.activeSubscriptions} value="286" icon={<CreditCard className="h-4 w-4" />} description="92% retention" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-accent" />
                {t.admin.analytics}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "New registrations", value: "34", change: "+12%" },
                  { label: "Appointments booked", value: "128", change: "+8%" },
                  { label: "Records created", value: "256", change: "+15%" },
                  { label: "Active sessions", value: "89", change: "+5%" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                      <span className="text-xs font-medium text-primary">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-accent" />
                {t.admin.systemHealth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { service: "Database", status: "Healthy", uptime: "99.9%" },
                  { service: "Authentication", status: "Healthy", uptime: "100%" },
                  { service: "File Storage", status: "Healthy", uptime: "99.8%" },
                  { service: "API Gateway", status: "Healthy", uptime: "99.95%" },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{service.service}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{service.uptime}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-muted px-2 py-0.5 text-xs font-medium text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {service.status}
                      </span>
                    </div>
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
