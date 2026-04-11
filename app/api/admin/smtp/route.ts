import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSmtpSettings, saveSmtpSettings } from '@/lib/mysql/platform';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const settings = await getSmtpSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in GET /api/admin/smtp:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'super_admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });

    const payload = await request.json();
    const ok = await saveSmtpSettings({
      host: payload.host,
      port: Number(payload.port),
      user: payload.user,
      password: payload.password,
      secure: !!payload.secure,
      from_email: payload.from_email,
      from_name: payload.from_name,
    });

    if (!ok) {
      return NextResponse.json({ message: 'Failed to save SMTP settings' }, { status: 400 });
    }

    const settings = await getSmtpSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in PUT /api/admin/smtp:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
