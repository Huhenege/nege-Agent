import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a Supabase client with the service role key for admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, fullName, role, companyId, jobTitle, inviterName } = await req.json();

    console.log(`Processing invitation for ${email} in company ${companyId}`);

    // 1. Check if user already exists in Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    let user = (userData?.users || []).find(u => u.email === email);

    if (!user) {
      console.log("User not found, creating new Auth user...");
      // 2. Create new Auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: role }
      });

      if (createError) throw createError;
      user = newUser.user;
    }

    if (!user) throw new Error("Failed to identify or create user.");

    // 3. Ensure Profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        full_name: fullName,
        role: role
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) throw profileError;

    // 4. Link to Company
    const { error: linkError } = await supabaseAdmin
      .from('company_users')
      .upsert({
        id: user.id,
        company_id: companyId,
        job_title: jobTitle
      }, { onConflict: 'id' });

    if (linkError) throw linkError;

    // 5. Fetch company name for email
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    // 6. Send Invitation Email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789') {
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Retail Agent <onboarding@resend.dev>',
        to: [email],
        subject: `You've been invited to join ${company?.name || 'Retail Agent'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 24px;">Welcome to Retail Agent!</h2>
            <p>Hello <strong>${fullName}</strong>,</p>
            <p><strong>${inviterName}</strong> has invited you to join the team at <strong>${company?.name || 'your organization'}</strong> as a <strong>${role === 'company_admin' ? 'Administrator' : 'Field Agent'}</strong>.</p>
            <p>You can now log in using your email address. If you haven't set a password yet, please use the "Forgot Password" link on the login page.</p>
            <div style="margin: 32px 0;">
              <a href="${(process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('.supabase.co', '')}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Log In to Dashboard
              </a>
            </div>
            <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Retail Agent. All rights reserved.</p>
          </div>
        `,
      });
      if (emailError) console.error('Resend error:', emailError);
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error('Invite API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
