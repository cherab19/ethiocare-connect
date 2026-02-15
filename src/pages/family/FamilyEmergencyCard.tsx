import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import DashboardLayout, { getFamilyNav } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Phone, Droplets, AlertTriangle, User } from "lucide-react";

export default function FamilyEmergencyCard() {
  const { t } = useLanguage();
  const { tenantId } = useAuth();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["family_members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("family_members").select("*").eq("tenant_id", tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  return (
    <DashboardLayout navItems={getFamilyNav(t)} title={t.family.emergencyCard}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Emergency health cards for quick access during emergencies.</p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{t.common.loading}</div>
        ) : members.length === 0 ? (
          <Card className="shadow-warm"><CardContent className="flex flex-col items-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Add family members to generate emergency cards.</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {members.map((member) => (
              <Card key={member.id} className="overflow-hidden shadow-warm border-2 border-destructive/20">
                <div className="bg-destructive/10 px-6 py-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  <span className="font-bold text-destructive text-sm uppercase tracking-wide">Emergency Health Card</span>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{member.full_name}</h3>
                    <div className="flex gap-2 mt-1">
                      {member.gender && <Badge variant="secondary">{member.gender}</Badge>}
                      {member.relationship && <Badge variant="secondary">{member.relationship}</Badge>}
                    </div>
                  </div>

                  {member.date_of_birth && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Date of Birth</p>
                      <p className="text-sm font-medium text-foreground">{new Date(member.date_of_birth).toLocaleDateString()}</p>
                    </div>
                  )}

                  {member.blood_type && (
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium">Blood Type</p>
                        <p className="text-lg font-bold text-destructive">{member.blood_type}</p>
                      </div>
                    </div>
                  )}

                  {member.allergies && member.allergies.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium">Allergies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.allergies.map((a, i) => <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>)}
                        </div>
                      </div>
                    </div>
                  )}

                  {(member.emergency_contact || member.emergency_phone) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium">Emergency Contact</p>
                        <p className="text-sm font-medium text-foreground">{member.emergency_contact}</p>
                        {member.emergency_phone && <p className="text-sm text-primary font-medium">{member.emergency_phone}</p>}
                      </div>
                    </div>
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
