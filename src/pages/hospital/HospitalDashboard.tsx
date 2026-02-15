import DashboardLayout, { getHospitalNav } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Clock, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HospitalDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardLayout navItems={getHospitalNav(t)} title={t.hospital.dashboard}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t.hospital.patients} value={156} icon={<Users className="h-4 w-4" />} description="12 new this week" />
          <StatCard title={t.hospital.todayAppointments} value={8} icon={<Calendar className="h-4 w-4" />} description="3 remaining" />
          <StatCard title={t.hospital.pendingRequests} value={5} icon={<FileText className="h-4 w-4" />} />
          <StatCard title={t.hospital.doctors} value={12} icon={<UserCog className="h-4 w-4" />} description="4 on duty" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-accent" />
                {t.hospital.todayAppointments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { patient: "Liya Abebe", time: "9:00 AM", doctor: "Dr. Mekdes", status: "confirmed" },
                  { patient: "Dawit Haile", time: "10:30 AM", doctor: "Dr. Solomon", status: "confirmed" },
                  { patient: "Sara Tadesse", time: "2:00 PM", doctor: "Dr. Mekdes", status: "requested" },
                ].map((apt, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor} — {apt.time}</p>
                    </div>
                    <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-accent" />
                {t.hospital.pendingRequests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { family: "Abebe Family", member: "Liya Abebe", type: "Full records access" },
                  { family: "Haile Family", member: "Dawit Haile", type: "Lab results only" },
                ].map((req, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{req.family}</p>
                      <p className="text-xs text-muted-foreground">{req.member} — {req.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Approve</button>
                      <button className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground">Deny</button>
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
