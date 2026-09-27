export const siteUrl = 'https://pstack.nishilfaldu.site';
export const siteName = 'pstack reader';
export const siteDescription = 'Read the pstack guide and browse its complete library of skills, playbooks, agents, and automations.';
export const shareImage = '/opengraph-image.png';

export function docsUrl(slug?: string[]) {
  return `${siteUrl}/docs${slug?.length ? `/${slug.join('/')}` : ''}`;
}
