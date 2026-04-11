import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserById } from '@/lib/mysql/utils';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const user = await getUserById(session.user.id!);

  if (!user || (user.status && user.status === 'inactive')) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role || 'user',
    status: user.status || 'active',
    avatar_url: user.avatar_url,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
