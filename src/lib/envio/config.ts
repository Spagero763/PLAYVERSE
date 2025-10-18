// Envio integration stub: add your project IDs/endpoints here.
export const Envio = {
  HYPERINDEX_URL: process.env.NEXT_PUBLIC_ENVIO_HYPERINDEX_URL,
  HYPERSYNC_URL: process.env.NEXT_PUBLIC_ENVIO_HYPERSYNC_URL,
};

export function isEnvioEnabled() {
  return Boolean(Envio.HYPERINDEX_URL || Envio.HYPERSYNC_URL);
}

export async function fetchDelegationsForOwner(owner: string) {
  if (!Envio.HYPERINDEX_URL) return [] as any[];
  try {
    const res = await fetch(`${Envio.HYPERINDEX_URL}/delegations?owner=${owner}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
