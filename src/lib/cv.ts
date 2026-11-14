import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cvDownloadNames, cvFiles } from '../data/cv';

export async function createCvResponse(language: keyof typeof cvFiles) {
  const fileName = cvFiles[language];
  const pdf = await readFile(resolve('CV', fileName));
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cvDownloadNames[language]}"`,
    },
  });
}
