import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCog, Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
const ALL_ROLES: AppRole[] = ["super_admin", "family_admin", "family_member", "hospital_admin", "doctor", "staff"];

export default function AdminUsers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<AppRole | "">("");

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

  const getRolesForUser = (userId: string) => allRoles.filter((r) => r.user_id === userId);

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_roles"] });
      setNewRole("");
      toast({ title: "Role added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_roles"] });
      toast({ title: "Role removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const selectedProfile = profiles.find((p) => p.user_id === selectedUser);
  const selectedUserRoles = selectedUser ? getRolesForUser(selectedUser) : [];
  const availableRoles = ALL_ROLES.filter((r) => !selectedUserRoles.some((ur) => ur.role === r));

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
            {profiles.map((profile) => {
              const userRoles = getRolesForUser(profile.user_id);
              return (
                <Card key={profile.id} className="shadow-warm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{profile.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{profile.phone || "No phone"}</p>
                      <p className="text-xs text-muted-foreground">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.map((ur) => (
                          <Badge key={ur.id} variant="secondary">{ur.role}</Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedUser(profile.user_id)}>
                        <UserCog className="h-3.5 w-3.5" /> Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Role Management Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(o) => { if (!o) setSelectedUser(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Roles — {selectedProfile?.full_name || "User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Current Roles</p>
                {selectedUserRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserRoles.map((ur) => (
                      <div key={ur.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                        <Badge>{ur.role}</Badge>
                        <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => removeRoleMutation.mutate(ur.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {availableRoles.length > 0 && (
                <div className="flex gap-2">
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Add role..." /></SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="gap-1"
                    disabled={!newRole || addRoleMutation.isPending}
                    onClick={() => { if (newRole && selectedUser) addRoleMutation.mutate({ userId: selectedUser, role: newRole }); }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
