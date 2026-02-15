import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getHospitalNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function HospitalStaff() {
  const { t } = useLanguage();

  return (
    <DashboardLayout navItems={getHospitalNav(t)} title={t.hospital.doctors}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Manage doctors and staff members assigned to this hospital.</p>
        <Card className="shadow-warm">
          <CardContent className="flex flex-col items-center py-12">
            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Staff management will be available once hospital verification is complete.</p>
            <p className="text-xs text-muted-foreground mt-2">Contact admin to assign doctors and staff to your hospital.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
