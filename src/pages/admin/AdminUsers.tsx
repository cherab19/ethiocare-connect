import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const { t } = useLanguage();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getRolesForUser = (userId: string) => allRoles.filter((r) => r.user_id === userId).map((r) => r.role);

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.users}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{profiles.length} registered users</p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : profiles.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{profile.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{profile.phone || "No phone"}</p>
                    <p className="text-xs text-muted-foreground">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getRolesForUser(profile.user_id).map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
