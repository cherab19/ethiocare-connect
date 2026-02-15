import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getHospitalNav } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, XCircle } from "lucide-react";

export default function HospitalPatients() {
  const { t } = useLanguage();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Access requests targeting this hospital
  const { data: accessRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["access_requests", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("access_requests")
        .select("*, family_members(full_name)")
        .eq("target_tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Approved patients - family members we have access to
  const approvedRequests = accessRequests.filter((r) => r.status === "approved");
  const pendingRequests = accessRequests.filter((r) => r.status === "pending");

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("access_requests")
        .update({ status, responded_by: user!.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access_requests"] });
      toast({ title: "Request updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout navItems={getHospitalNav(t)} title={t.hospital.patients}>
      <div className="space-y-8">
        {/* Pending Access Requests */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t.hospital.pendingRequests} ({pendingRequests.length})</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="shadow-warm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{(req as any).family_members?.full_name || "Family Member"}</p>
                      <p className="text-xs text-muted-foreground">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={() => respondMutation.mutate({ id: req.id, status: "approved" })}>
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => respondMutation.mutate({ id: req.id, status: "denied" })}>
                        <XCircle className="h-3.5 w-3.5" /> Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approved Patients */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">Linked Patients ({approvedRequests.length})</h2>
          {loadingRequests ? (
            <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
          ) : approvedRequests.length === 0 ? (
            <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No linked patients yet. Families can share access to their records.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvedRequests.map((req) => (
                <Card key={req.id} className="shadow-warm">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{(req as any).family_members?.full_name}</p>
                    <Badge variant="secondary" className="mt-1">Approved</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">Since: {new Date(req.updated_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
