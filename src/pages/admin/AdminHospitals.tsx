import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getAdminNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export default function AdminHospitals() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["admin_hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").eq("type", "hospital").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("tenants").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_hospitals"] });
      toast({ title: "Hospital updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout navItems={getAdminNav(t)} title={t.admin.hospitals}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{hospitals.length} registered hospitals</p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : hospitals.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hospitals registered yet.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{hospital.name}</p>
                    <p className="text-xs text-muted-foreground">Registered: {new Date(hospital.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={hospital.is_active ? "default" : "secondary"}>
                      {hospital.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => toggleActive.mutate({ id: hospital.id, is_active: !hospital.is_active })}
                    >
                      {hospital.is_active ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      {hospital.is_active ? "Deactivate" : "Activate"}
                    </Button>
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
