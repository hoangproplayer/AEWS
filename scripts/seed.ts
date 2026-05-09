import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

async function seed() {
  console.log("Starting seed...");

  // 1. Create 5000 Students (in batches of 50)
  const batchSize = 50;
  const totalStudents = 5000;
  
  for (let i = 0; i < totalStudents; i += batchSize) {
    const batch = writeBatch(db);
    for (let j = 0; j < batchSize && (i + j) < totalStudents; j++) {
      const studentId = `SV${(i + j + 1).toString().padStart(6, '0')}`;
      const levels = ['SAFE', 'WARNING', 'DANGER'];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      batch.set(doc(db, 'students', studentId), {
        id: studentId,
        name: `Student ${i + j + 1}`,
        class: i % 4 === 0 ? "20CNTT1" : i % 4 === 1 ? "20CNTT2" : "20CNTT3",
        gpa: Number((Math.random() * 4).toFixed(2)),
        level,
        status: "PENDING",
        lastAnalyzed: new Date().toISOString()
      });
    }
    await batch.commit();
    console.log(`Committed ${Math.min(i + batchSize, totalStudents)} students...`);
    await new Promise(r => setTimeout(r, 200)); // Small delay
  }

  console.log("Seed finished.");
  process.exit(0);
}

seed();
