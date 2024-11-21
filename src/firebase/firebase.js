import { initializeApp } from 'firebase/app';
import { get, ref, getDatabase, query, orderByChild, limitToLast } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { fetchKids } from '../store/allowanceSlice';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const fetchFamilyByUserId = async (userId) => {
  try {
    const snapshot = await database
                        .ref('families')
                        .orderByChild('linkedAccounts')
                        .equalTo(userId)
                        .once('value');
    if (snapshot.exists()) {
      return snaptshot.val();
    } else {
      throw new Error("No family found for this user");
    }

  } catch (error) {
    console.log("Error fetching fmaily: ", error);
    throw error;
  }
};

export const fetchAllKids = async (familyId) => {
  const kidsRef = ref(database, `families/${familyId}/kids`);
  const snapshot = await get(kidsRef);
  if (snapshot.exists()) {
    const kidsData = snapshot.val();
    return Object.entries(kidsData).reduce((acc, [key, kid]) => {
      acc[key] = {
        ...kid,
        key,
        familyId,
      };
      return acc;
    }, {});
  } else {
    return {};
  }
};

export const fetchKidTransactions = async (familyId, kidId) => {
  try {
    const transactionsRef = ref(database, `families/${familyId}/kids/${kidId}/transactions`);
    const transactionQuery = query(transactionsRef, orderByChild('createdAt'), limitToLast(10));
    const snapshot = await get(transactionQuery);

    if (snapshot.exists()) {
      const transactionData = snapshot.val();
      const reversedTransactions = Object.entries(transactionData).reverse();
      return reversedTransactions.reduce((acc, [key, transaction]) => {
        acc[key] = {
          ...transaction,
          key,
        };
        return acc;
      }, {});
    } else {
      return {};
    }
  } catch (error) {
    console.log("fetchKidTransctions failed: ", error);
  }
};

export const fetchKidsData = async (familyId) => {
  const kids = await fetchAllKids(familyId);
  const kidsWithTransactions = await Promise.all(
    Object.entries(kids).map(async ([kidId, kid]) => {
      const transactions = await fetchKidTransactions(familyId, kidId);
      return {
        ...kid,
        transactions,
      };
    })
  );

  return kidsWithTransactions.reduce((acc, kid) => {
    acc[kid.key] = kid;
    return acc;
  }, {});
};

// export const fetchKidsData = async (familyId) => {
//   const kidsRef = ref(database, `families/${familyId}/kids`);
//   const snapshot = await get(kidsRef);
//   if (snapshot.exists()) {
//     const kidsData = snapshot.val();
//     return Object.entries(kidsData).reduce((acc, [key, kid]) => {
//       acc[key] = {
//         ...kid,
//         key,
//         familyId,
//         transactions: kid.transactions
//           ? Object.entries(kid.transactions).reduce((txAcc, [transactionKey, transaction]) => {
//             txAcc[transactionKey] = {
//               ...transaction,
//               key: transactionKey,
//             };
//             return txAcc;
//           }, {})
//           : {},
//       };
//       return acc;
//     }, {});
//   } else {
//     return {};
//   }
// };

export const fetchFamilyData = async (familyId) => {
  try {
    const familyRef = ref(database, `families/${familyId}/familyName`);
    const snapshot = await get(familyRef);
    if (snapshot.exists()) {
      const familyName = snapshot.val();
      return { familyId, familyName };
    } else {
      return {};
    }
  } catch (error) {
    console.log("Error fetching family data: ", error);
  }
};

const firebase = initializeApp(firebaseConfig);

const database = getDatabase(firebase);

const auth = getAuth(firebase);

export { firebase, auth, database as default }

