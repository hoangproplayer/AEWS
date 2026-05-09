import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    await setDoc(doc(db, 'test', 'one'), { ok: true });
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
test();
