import { createContext } from 'react';
import { AuthContextType } from './AuthContextTypes';

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  register: async () => ({ success: false, message: '', user: { id: '', username: '', openAiApiKey: '' } }),
  logout: () => {},
  firstLoginAfterRegistration: false,
  updateApiKey: async () => {},
  loading: false,
  updateWalletPublicKey: async () => {},
});

export default AuthContext;
