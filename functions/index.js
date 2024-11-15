import functions from 'firebase-functions';
import admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

exports.updateKidsAllowances = functions.pubsub.schedule('every friday 06:00')
  .timeZone('America/Vancouver')
  .onRun(async () => {
    try {
      const familiesSnapshot = await db.collection('families').get();

      familiesSnapshot.forEach(async (familyDoc) => {
        const familyData = familyDoc.data();
        const familyId = familyData.id;

        const kidsSnapshot = await db.collection(`families/${familyId}/kids`).get();
        
        kidsSnapshot.forEach(async (kidDoc) => {
          const kidData = kidDoc.data();
          const kidId = kidDoc.id;

          if (kidData.allowanceRate) {
            const transaction = {
              amount: kidData.allowanceRate,
              description: 'Weekly Allowance Rate Increase',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection(`families/${familyId}/kids/${kidId}/transactions`).add(transaction);
            const updateBalance = (kidData.currentBalance || 0) + kidData.allowanceRate;

            await db.collection(`families/${familyId}/kids`).doc(kidId).update({
              currentBalance: updateBalance,
            });
            console.log(`Transaction created and balance updated for kid ${kidData.name}: `), transaction;
          }
        });
      });
      console.log("Kid's alloances updated succesfully.");
    } catch (error) {
      console.error("Erro updated kid's allownaces: ", error);
    }
  });
