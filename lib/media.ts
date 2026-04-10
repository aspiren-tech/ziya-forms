import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';

const MEDIA_ROOT = path.join(process.cwd(), 'public', 'uploads');

const safeSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');

const mimeToExtension = (mimeType: string) => {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
};

const getRelativePathFromUrl = (url: string) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  if (url.startsWith('/uploads/')) {
    return url.replace(/^\//, '');
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname.replace(/^\//, '');
    }
  } catch {
    return null;
  }

  return null;
};

export function isManagedMediaUrl(url?: string | null) {
  return Boolean(getRelativePathFromUrl(url || ''));
}

export async function saveUploadedImage(file: File, scope: string) {
  const normalizedScope = safeSegment(scope || 'media') || 'media';
  const extension = mimeToExtension(file.type || 'image/jpeg');
  const fileName = `${nanoid(16)}.${extension}`;
  const relativeDir = path.join('uploads', normalizedScope);
  const relativePath = path.join(relativeDir, fileName);
  const absoluteDir = path.join(MEDIA_ROOT, normalizedScope);
  const absolutePath = path.join(absoluteDir, fileName);

  await fs.mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return `/${relativePath.replace(/\\/g, '/')}`;
}

export async function deleteManagedMediaUrl(url?: string | null) {
  const relativePath = getRelativePathFromUrl(url || '');

  if (!relativePath) {
    return false;
  }

  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  try {
    await fs.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}
