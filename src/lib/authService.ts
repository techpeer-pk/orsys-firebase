import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from './firebase'
import { getAppUser, AppUser } from './firestore'

export interface AuthUser extends AppUser {
  firebaseUser: FirebaseUser
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const profile = await getAppUser(cred.user.uid)

    if (!profile) throw new Error('User profile not found. Contact admin.')
    if (profile.status !== 'active') throw new Error('Your account is inactive. Contact admin.')

    return { ...profile, firebaseUser: cred.user }
  },

  logout: () => signOut(auth),

  onAuthChange: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { callback(null); return }
      const profile = await getAppUser(firebaseUser.uid)
      if (!profile || profile.status !== 'active') { callback(null); return }
      callback({ ...profile, firebaseUser })
    })
  },
}
