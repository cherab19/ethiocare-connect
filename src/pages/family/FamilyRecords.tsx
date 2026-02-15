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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2 } from "lucide-react";

const RECORD_TYPES = ["Lab Result", "Prescription", "Diagnosis", "Imaging", "Procedure", "Consultation", "Other"];

export default function FamilyRecords() {
  const { t } = useLanguage();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ family_member_id: "", title: "", record_type: "", description: "" });

  const { data: members = [] } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("family_members").select("id, full_name").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["medical_records", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("medical_records")
        .select("*, family_members(full_name)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("medical_records").insert({
        family_member_id: data.family_member_id,
        title: data.title,
        record_type: data.record_type,
        description: data.description || null,
        tenant_id: tenantId!,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_records"] });
      setDialogOpen(false);
      setForm({ family_member_id: "", title: "", record_type: "", description: "" });
      toast({ title: "Record added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medical_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_records"] });
      toast({ title: "Record deleted" });
    },
  });

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.healthRecords}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{records.length} health records</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Record</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Family Member</Label>
                  <Select value={form.family_member_id} onValueChange={(v) => setForm({ ...form, family_member_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.record_type} onValueChange={(v) => setForm({ ...form, record_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{RECORD_TYPES.map((rt) => <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>{t.common.save}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : records.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No health records yet.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Card key={record.id} className="shadow-warm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{record.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{record.record_type}</Badge>
                      <span className="text-xs text-muted-foreground">{(record as any).family_members?.full_name}</span>
                    </div>
                    {record.description && <p className="text-sm text-muted-foreground line-clamp-1">{record.description}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(record.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(record.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
