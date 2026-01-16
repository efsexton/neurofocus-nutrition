import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

export default function UserEditForm({ user, coaches, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    user_type: user.user_type || 'client',
    phone: user.phone || '',
    assigned_coach_id: user.assigned_coach_id || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        user_type: formData.user_type,
        phone: formData.phone,
        assigned_coach_id: formData.assigned_coach_id || null,
      };
      
      const updatedUser = await base44.asServiceRole.entities.User.update(user.id, payload);
      
      onSave(updatedUser);
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(`Failed to update user: ${err.message}`);
    }
    setSaving(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit User: {user.email}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>System Role</Label>
            <div className="mt-2 p-3 bg-stone-100 rounded-md">
              <span className="font-medium capitalize">{user.role}</span>
              <span className="text-stone-600 text-sm ml-2">(not editable)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="user_type">User Type *</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) => setFormData({ ...formData, user_type: value })}
            >
              <SelectTrigger id="user_type" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
            className="mt-2"
          />
        </div>

        {formData.user_type === 'client' && (
          <div>
            <Label htmlFor="assigned_coach">Assigned Coach</Label>
            <Select
              value={formData.assigned_coach_id}
              onValueChange={(value) => setFormData({ ...formData, assigned_coach_id: value })}
            >
              <SelectTrigger id="assigned_coach" className="mt-2">
                <SelectValue placeholder="Select a coach..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No Coach Assigned</SelectItem>
                {coaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.full_name || coach.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-500 mt-1">
              This coach will be able to view this client's diary entries
            </p>
          </div>
        )}

        <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
          <h4 className="font-medium text-stone-900 mb-2">Additional Info</h4>
          <div className="space-y-1 text-sm text-stone-600">
            <p><strong>Full Name:</strong> {user.full_name || 'Not set'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Onboarding Status:</strong> {user.onboarding_completed ? '✓ Completed' : '⏳ Pending'}</p>
            <p><strong>Account Created:</strong> {new Date(user.created_date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}