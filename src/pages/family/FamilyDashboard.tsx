import DashboardLayout, { getFamilyNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Syringe, Shield, Heart, Clock } from "lucide-react";

export default function FamilyDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.dashboard}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t.family.members}
            value={4}
            icon={<Users className="h-4 w-4" />}
            description="2 children, 2 adults"
          />
          <StatCard
            title={t.family.upcomingAppointments}
            value={2}
            icon={<Calendar className="h-4 w-4" />}
            description="Next: Feb 18, 2026"
          />
          <StatCard
            title={t.family.vaccinationsDue}
            value={1}
            icon={<Syringe className="h-4 w-4" />}
            description="OPV3 — March 2026"
          />
          <StatCard
            title={t.family.emergencyCard}
            value="Active"
            icon={<Shield className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-accent" />
                {t.family.recentRecords}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Liya A.", type: "Check-up", date: "Feb 10, 2026", status: "Completed" },
                  { name: "Dawit A.", type: "Vaccination", date: "Jan 28, 2026", status: "Completed" },
                  { name: "Sara A.", type: "Lab Result", date: "Jan 15, 2026", status: "Reviewed" },
                ].map((record, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{record.name}</p>
                      <p className="text-xs text-muted-foreground">{record.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                      <span className="inline-block rounded-full bg-emerald-muted px-2 py-0.5 text-xs font-medium text-primary">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-accent" />
                {t.family.wellnessPlanner}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Annual check-up — Liya", due: "March 2026", color: "bg-accent/20 text-accent-foreground" },
                  { label: "Dental visit — Family", due: "April 2026", color: "bg-secondary text-secondary-foreground" },
                  { label: "Eye exam — Dawit", due: "May 2026", color: "bg-emerald-muted text-primary" },
                ].map((plan, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full px-2 py-1 text-xs font-medium ${plan.color}`}>
                        {plan.due}
                      </div>
                      <p className="text-sm text-foreground">{plan.label}</p>
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
