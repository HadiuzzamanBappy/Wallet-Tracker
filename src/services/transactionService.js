import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  Timestamp,
  limit
} from 'firebase/firestore';

export const addTransaction = async (userId, transactionData) => {
  try {
    // Add transaction
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      userId,
      createdAt: Timestamp.now(),
      date: Timestamp.fromDate(new Date(transactionData.date))
    });
    
    // Update user balance
    await updateUserBalance(userId, transactionData.type, transactionData.amount);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserBalance = async (userId, type, amount) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;
      const totalIncome = userData.totalIncome || 0;
      const totalExpense = userData.totalExpense || 0;
      
      const newBalance = type === 'income' 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      const newTotalIncome = type === 'income' 
        ? totalIncome + amount 
        : totalIncome;
      
      const newTotalExpense = type === 'expense' 
        ? totalExpense + amount 
        : totalExpense;
      
      await updateDoc(userRef, {
        balance: newBalance,
        totalIncome: newTotalIncome,
        totalExpense: newTotalExpense,
        updatedAt: Timestamp.now()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating balance:", error);
    return { success: false, error: error.message };
  }
};

export const getTransactions = async (userId, filters = {}) => {
  try {
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    let q = query(transactionsRef, orderBy('date', 'desc'));
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate()
    }));
    
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return { success: false, error: error.message };
  }
};

export const getRecentTransactions = async (userId, limitCount = 10) => {
  return getTransactions(userId, { limit: limitCount });
};

export const deleteTransaction = async (userId, transactionId, transactionData) => {
  try {
    // Delete transaction
    const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`);
    await deleteDoc(transactionRef);
    
      // Reverse the balance update by subtracting the original transaction effect
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentBalance = userData.balance || 0;
        const totalIncome = userData.totalIncome || 0;
        const totalExpense = userData.totalExpense || 0;
        
        // Reverse the transaction effect
        let newBalance = currentBalance;
        let newTotalIncome = totalIncome;
        let newTotalExpense = totalExpense;
        
        if (transactionData.type === 'income') {
          // Remove income: subtract from balance and totalIncome
          newBalance = currentBalance - transactionData.amount;
          newTotalIncome = totalIncome - transactionData.amount;
        } else {
          // Remove expense: add back to balance and subtract from totalExpense
          newBalance = currentBalance + transactionData.amount;
          newTotalExpense = totalExpense - transactionData.amount;
        }
        
        await updateDoc(userRef, {
          balance: newBalance,
          totalIncome: newTotalIncome,
          totalExpense: newTotalExpense,
          updatedAt: Timestamp.now()
        });
      }    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
};