import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/mysql/utils';
import { deleteManagedMediaUrl } from '@/lib/media';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(currentUser.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        status: user.status,
        role: user.role,
        billing_plan: user.billing_plan,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users/me:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const existingUser = await getUserById(currentUser.id);
    const updated = await updateUser(currentUser.id, {
      full_name: typeof payload.full_name === 'string' ? payload.full_name.trim() : undefined,
      avatar_url: typeof payload.avatar_url === 'string' ? payload.avatar_url : payload.avatar_url === null ? null : undefined,
    });

    if (!updated) {
      return NextResponse.json({ message: 'No changes applied' }, { status: 400 });
    }

    const user = await getUserById(currentUser.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (existingUser?.avatar_url && existingUser.avatar_url !== user.avatar_url) {
      await deleteManagedMediaUrl(existingUser.avatar_url);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        status: user.status,
        role: user.role,
        billing_plan: user.billing_plan,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/users/me:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
