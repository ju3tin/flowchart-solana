import { APP_CONFIG } from '../config/appConfig';

export const getValidBetaCodes = (): Set<string> => {
  if (!APP_CONFIG.BETA_CODE) throw new Error('BETA_CODE is not set in appConfig.ts');
  const codes = APP_CONFIG.BETA_CODE;
  if (codes) console.log("codes", codes);
  return new Set(codes.split(',').map(code => code.trim().toUpperCase()));
};
