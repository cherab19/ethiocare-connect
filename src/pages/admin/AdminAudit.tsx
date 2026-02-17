import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: any;
  new_data: any;
  performed_by: string;
  tenant_id: string | null;
  created_at: string;
}

export default function AdminAudit() {
  const { t } = useLanguage();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const actionColor = (action: string) => {
    if (action === "INSERT") return "default";
    if (action === "UPDATE") return "secondary";
    return "destructive";
  };

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.auditLog}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {logs.length} audit entries — tracking all doctor/staff actions on medical records.
        </p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : logs.length === 0 ? (
          <Card className="shadow-warm">
            <CardContent className="flex flex-col items-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No audit entries yet.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Actions on medical records will automatically appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} className="shadow-warm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionColor(log.action)}>{log.action}</Badge>
                      <span className="text-sm font-medium text-foreground">{log.table_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Record: {log.record_id.slice(0, 8)}… | By: {log.performed_by.slice(0, 8)}…
                  </p>
                  {log.new_data?.title && (
                    <p className="text-sm text-foreground">Title: {log.new_data.title}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
