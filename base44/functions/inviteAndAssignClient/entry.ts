import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, assigned_coach_id } = await req.json();

    await base44.asServiceRole.users.inviteUser(email, 'user');

    return Response.json({ success: true, message: 'Invite sent. Please run fixUserData after user registers.' });
});