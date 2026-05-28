import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, user_type, assigned_coach_id } = await req.json();

    const updated = await base44.asServiceRole.entities.User.update(user_id, {
        user_type,
        assigned_coach_id: assigned_coach_id || null,
    });

    return Response.json({ success: true, updated });
});