import { createCvResponse } from '../lib/cv';

// Keep the previous public URL as an alias for the current Spanish CV.
export const GET = () => createCvResponse('es');
