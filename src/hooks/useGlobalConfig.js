import { useEffect, useState } from 'react';
import { DEFAULT_GLOBAL_CONFIG } from '../data/defaultGlobalConfig';
import { getPublicGlobalConfig, mergeGlobalConfig } from '../api/globalConfig';

export function useGlobalConfig() {
  const [config, setConfig] = useState(DEFAULT_GLOBAL_CONFIG);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      setLoading(true);
      getPublicGlobalConfig().then((data) => { if (!cancelled) setConfig(mergeGlobalConfig(data)); }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    };
    const refresh = () => load();
    load();
    window.addEventListener('global-config:refresh', refresh);
    return () => { cancelled = true; window.removeEventListener('global-config:refresh', refresh); };
  }, []);
  return { config, loading };
}
