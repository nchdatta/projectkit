'use server';

import { revalidatePath } from 'next/cache';

export const triggerRevalidate = async (sourcePath: string, type: 'layout' | 'page' = 'page') => {
  revalidatePath(sourcePath, type);
};
