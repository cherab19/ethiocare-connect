import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getFamilyNav } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Syringe } from "lucide-react";

// Ethiopian EPI Schedule vaccines
const ETHIOPIAN_VACCINES = [
  "BCG", "OPV0", "OPV1", "OPV2", "OPV3", "IPV1", "IPV2",
  "Penta1", "Penta2", "Penta3", "PCV1", "PCV2", "PCV3",
  "Rota1", "Rota2", "Measles1", "Measles2", "Vitamin A",
  "MenA", "HPV", "TT1", "TT2", "TT3", "TT4", "TT5",
];

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/20 text-accent-foreground",
  completed: "bg-emerald-muted text-primary",
  overdue: "bg-destructive/10 text-destructive",
  missed: "bg-secondary text-secondary-foreground",
};

export default function FamilyVaccinations() {
  const { t } = useLanguage();
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ family_member_id: "", vaccine_name: "", scheduled_date: "", dose_number: "1" });

  const { data: members = [] } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("family_members").select("id, full_name").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ["vaccinations", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("vaccinations").insert({
        family_member_id: data.family_member_id,
        vaccine_name: data.vaccine_name,
        scheduled_date: data.scheduled_date || null,
        dose_number: parseInt(data.dose_number) || 1,
        tenant_id: tenantId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      setDialogOpen(false);
      toast({ title: "Vaccination scheduled" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const markComplete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vaccinations").update({ status: "completed", administered_date: new Date().toISOString().split("T")[0] }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      toast({ title: "Marked as completed" });
    },
  });

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.vaccinations}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{vaccinations.length} vaccination records</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Schedule Vaccination</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Vaccination</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Family Member</Label>
                  <Select value={form.family_member_id} onValueChange={(v) => setForm({ ...form, family_member_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vaccine</Label>
                  <Select value={form.vaccine_name} onValueChange={(v) => setForm({ ...form, vaccine_name: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vaccine" /></SelectTrigger>
                    <SelectContent>{ETHIOPIAN_VACCINES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dose #</Label>
                    <Input type="number" min="1" max="5" value={form.dose_number} onChange={(e) => setForm({ ...form, dose_number: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>{t.common.save}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : vaccinations.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <Syringe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No vaccinations recorded yet.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {vaccinations.map((vax) => (
              <Card key={vax.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{vax.vaccine_name} — Dose {vax.dose_number}</p>
                    <p className="text-sm text-muted-foreground">{(vax as any).family_members?.full_name}</p>
                    {vax.scheduled_date && <p className="text-xs text-muted-foreground">Scheduled: {new Date(vax.scheduled_date).toLocaleDateString()}</p>}
                    {vax.administered_date && <p className="text-xs text-primary">Administered: {new Date(vax.administered_date).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[vax.status] || ""}>{vax.status}</Badge>
                    {vax.status === "scheduled" && (
                      <Button size="sm" variant="outline" onClick={() => markComplete.mutate(vax.id)}>Mark Done</Button>
                    )}
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
