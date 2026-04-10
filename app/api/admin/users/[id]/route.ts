import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteAdminUser, getAdminUserById, updateAdminUser } from '@/lib/mysql/admin';

type Params = { params: Promise<{ id: string }> };

const validRoles = new Set(['super_admin', 'admin', 'user']);
const validStatuses = new Set(['active', 'inactive']);

export async function GET(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { id } = await segmentData.params;
    const user = await getAdminUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { id } = await segmentData.params;
    const payload = await request.json();
    const user = await getAdminUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const nextRole = typeof payload.role === 'string' ? payload.role : undefined;
    const nextStatus = typeof payload.status === 'string' ? payload.status : undefined;

    if (id === currentUser.id && (nextRole || nextStatus)) {
      return NextResponse.json({ message: 'You cannot change your own role or status' }, { status: 400 });
    }

    if (nextRole && !validRoles.has(nextRole)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    if (nextStatus && !validStatuses.has(nextStatus)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updated = await updateAdminUser(id, {
      name: typeof payload.name === 'string' ? payload.name.trim() : undefined,
      email: typeof payload.email === 'string' ? payload.email.trim() : undefined,
      role: nextRole,
      status: nextStatus as 'active' | 'inactive' | undefined,
      avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : payload.avatarUrl === null ? null : undefined,
    });

    if (!updated) {
      return NextResponse.json({ message: 'No changes applied' }, { status: 400 });
    }

    const refreshedUser = await getAdminUserById(id);
    return NextResponse.json({ user: refreshedUser });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[id]:', error);

    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, segmentData: Params) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { id } = await segmentData.params;

    if (id === currentUser.id) {
      return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 });
    }

    const user = await getAdminUserById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const deleted = await deleteAdminUser(id);

    if (!deleted) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
