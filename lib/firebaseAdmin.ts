// Acceso del SERVIDOR a Firestore (Admin SDK). La cuenta de servicio vive solo
// en la variable de entorno FIREBASE_SERVICE_ACCOUNT de Vercel — mismo nombre y
// mismo valor que usa el portal interno, para no administrar dos credenciales.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;

export function adminDb(): Firestore {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada.");
  if (!_app) {
    let creds: Record<string, unknown>;
    try { creds = JSON.parse(raw); }
    catch { throw new Error("FIREBASE_SERVICE_ACCOUNT no es un JSON válido."); }
    _app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(creds as never) });
  }
  return getFirestore(_app);
}
