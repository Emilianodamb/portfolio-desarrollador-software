import type { APIRoute } from 'astro';
import { cvFiles } from '../../data/cv';
import { createCvResponse } from '../../lib/cv';

export function getStaticPaths() {
  return Object.keys(cvFiles).map((language) => ({ params: { language } }));
}

export const GET: APIRoute = ({ params }) => {
  if (params.language !== 'es' && params.language !== 'en') {
    return new Response(null, { status: 404 });
  }
  return createCvResponse(params.language);
};
