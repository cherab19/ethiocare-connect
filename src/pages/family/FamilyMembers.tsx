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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FamilyMembers() {
  const { t } = useLanguage();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", relationship: "", gender: "", date_of_birth: "", blood_type: "", emergency_contact: "", emergency_phone: "" });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase.from("family_members").select("*").eq("tenant_id", tenantId).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("family_members").insert({
        ...data,
        tenant_id: tenantId!,
        created_by: user!.id,
        date_of_birth: data.date_of_birth || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family_members"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Member added successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof form }) => {
      const { error } = await supabase.from("family_members").update({ ...data, date_of_birth: data.date_of_birth || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family_members"] });
      setDialogOpen(false);
      setEditingMember(null);
      resetForm();
      toast({ title: "Member updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("family_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family_members"] });
      toast({ title: "Member removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetForm = () => setForm({ full_name: "", relationship: "", gender: "", date_of_birth: "", blood_type: "", emergency_contact: "", emergency_phone: "" });

  const openEdit = (member: any) => {
    setEditingMember(member);
    setForm({
      full_name: member.full_name,
      relationship: member.relationship || "",
      gender: member.gender || "",
      date_of_birth: member.date_of_birth || "",
      blood_type: member.blood_type || "",
      emergency_contact: member.emergency_contact || "",
      emergency_phone: member.emergency_phone || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: form });
    } else {
      addMutation.mutate(form);
    }
  };

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.members}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{members.length} members in your family</p>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingMember(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{t.family.addMember}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? t.common.edit : t.family.addMember}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.common.fullName}</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["Self", "Spouse", "Child", "Parent", "Sibling", "Grandparent", "Other"].map((r) => (
                          <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select value={form.blood_type} onValueChange={(v) => setForm({ ...form, blood_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                          <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Phone</Label>
                    <Input value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending || updateMutation.isPending}>
                  {t.common.save}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : members.length === 0 ? (
          <Card className="shadow-warm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No family members yet. Add your first member to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="shadow-warm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{member.full_name}</CardTitle>
                      {member.relationship && <Badge variant="secondary" className="mt-1">{member.relationship}</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(member.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {member.gender && <p>Gender: {member.gender}</p>}
                  {member.date_of_birth && <p>DOB: {new Date(member.date_of_birth).toLocaleDateString()}</p>}
                  {member.blood_type && <p>Blood Type: <span className="font-medium text-destructive">{member.blood_type}</span></p>}
                  {member.emergency_phone && <p>Emergency: {member.emergency_phone}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
