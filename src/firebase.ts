import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  serverTimestamp,
  query,
  Firestore
} from 'firebase/firestore';
import { EmployeeDBItem } from './types';

// Environment variable configuration for Firebase (Vite client-side)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Safe conditional Firebase initialization
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    console.log("✅ Firebase Firestore 클라우드 DB가 연결되었습니다.");
  } catch (err) {
    console.warn("⚠️ Firebase 초기화 실패. 로컬 스토리지 모드로 자동 전환합니다:", err);
  }
} else {
  console.info("ℹ️ Firebase 환경변수 미설정: 브라우저 로컬 스토리지(LocalStorage) 모드로 안전하게 작동합니다.");
}

export { db };

// Save employee to Firestore & LocalStorage
export async function saveEmployee(item: EmployeeDBItem): Promise<boolean> {
  const documentId = item.i_arc || `temp_${Date.now()}`;
  
  // 1. Always save to local storage as fallback/immediate feedback
  try {
    const dbStr = localStorage.getItem('visa_employee_db') || '[]';
    const localDb: EmployeeDBItem[] = JSON.parse(dbStr);
    const idx = localDb.findIndex(e => e.i_arc === item.i_arc);
    const updated = { ...item, lastUpdated: new Date().toISOString().split('T')[0] };
    if (idx >= 0) {
      localDb[idx] = updated;
    } else {
      localDb.push(updated);
    }
    localStorage.setItem('visa_employee_db', JSON.stringify(localDb));
  } catch (err) {
    console.error('Local storage save error:', err);
  }

  // 2. Try saving to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'employees', documentId);
      await setDoc(docRef, {
        ...item,
        updatedAt: serverTimestamp(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      console.log(`Cloud sync success for ${item.i_surname}`);
      return true;
    } catch (err) {
      console.error('Firestore cloud save failed (Permission or Network). Local copy is safe:', err);
      return false;
    }
  }

  return true;
}

// Fetch all employees from Firestore, falling back to LocalStorage if error or no cloud db
export async function fetchEmployees(): Promise<{ source: 'cloud' | 'local'; items: EmployeeDBItem[] }> {
  if (db) {
    try {
      const q = query(collection(db, 'employees'));
      const querySnapshot = await getDocs(q);
      const cloudItems: EmployeeDBItem[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const { updatedAt, ...cleanItem } = data;
        cloudItems.push(cleanItem as EmployeeDBItem);
      });

      if (cloudItems.length > 0) {
        localStorage.setItem('visa_employee_db', JSON.stringify(cloudItems));
        return { source: 'cloud', items: cloudItems };
      }
    } catch (err) {
      console.warn('Firestore fetch failed (Permission or Network). Falling back to Local Storage:', err);
    }
  }

  // Fallback to local storage
  try {
    const dbStr = localStorage.getItem('visa_employee_db') || '[]';
    return { source: 'local', items: JSON.parse(dbStr) };
  } catch (err) {
    console.error('Local storage parse error:', err);
    return { source: 'local', items: [] };
  }
}

// Delete employee from Firestore & LocalStorage
export async function deleteEmployee(arc: string): Promise<boolean> {
  // 1. Delete from local storage
  try {
    const dbStr = localStorage.getItem('visa_employee_db') || '[]';
    let localDb: EmployeeDBItem[] = JSON.parse(dbStr);
    localDb = localDb.filter(e => e.i_arc !== arc);
    localStorage.setItem('visa_employee_db', JSON.stringify(localDb));
  } catch (err) {
    console.error('Local storage delete error:', err);
  }

  // 2. Delete from Firestore if available
  if (db) {
    try {
      await deleteDoc(doc(db, 'employees', arc));
      console.log(`Cloud delete success for ${arc}`);
      return true;
    } catch (err) {
      console.error('Firestore cloud delete failed (Permission or Network). Local copy updated:', err);
      return false;
    }
  }

  return true;
}
