import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function AdminAudit() {
  const { t } = useLanguage();

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.auditLog}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Track all actions performed by doctors and staff on patient records.</p>
        <Card className="shadow-warm">
          <CardContent className="flex flex-col items-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Audit logging is being set up. Doctor actions on medical records will be tracked here.</p>
            <p className="text-xs text-muted-foreground mt-2">All create, update, and delete operations on patient data will be logged.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
