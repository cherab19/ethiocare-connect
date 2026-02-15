import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getFamilyNav } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  requested: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-emerald-muted text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function FamilyAppointments() {
  const { t } = useLanguage();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ family_member_id: "", appointment_date: "", reason: "" });

  const { data: members = [] } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("family_members").select("id, full_name").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("appointments").insert({
        family_member_id: data.family_member_id,
        appointment_date: data.appointment_date,
        reason: data.reason || null,
        tenant_id: tenantId!,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setDialogOpen(false);
      setForm({ family_member_id: "", appointment_date: "", reason: "" });
      toast({ title: "Appointment requested" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.appointments}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{appointments.length} appointments</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Book Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Book Appointment</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Family Member</Label>
                  <Select value={form.family_member_id} onValueChange={(v) => setForm({ ...form, family_member_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe reason for visit..." />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>Request Appointment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : appointments.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No appointments yet.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <Card key={apt.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{(apt as any).family_members?.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(apt.appointment_date).toLocaleString()}
                    </div>
                    {apt.reason && <p className="text-sm text-muted-foreground">{apt.reason}</p>}
                  </div>
                  <Badge className={statusColors[apt.status] || ""}>{apt.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
