import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (id) {
      const fetchExpense = async () => {
        try {
          const docRef = doc(db, 'expenses', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAmount(String(data.amount));
            setType(data.type);
            setDescription(data.description);
            setDate(data.date);
          }
        } catch (error) {
          console.error('Error loading expense:', error);
          Alert.alert('Error', 'Failed to load expense.');
        }
      };
      fetchExpense();
    }
  }, [id]);

  const handleSave = async () => {
    console.log('👤 Current user from context:', user); // ✅ LOG added here

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save expenses.');
      console.log('❌ No authenticated user');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || !type || !description || !date) {
      Alert.alert('Validation Error', 'All fields are required and amount must be a number.');
      console.log('❌ Invalid input:', { amount, type, description, date });
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      type,
      description,
      date,
      userId: user.uid,
    };

    console.log('📤 Saving expense:', expenseData);

    try {
      if (id) {
        const ref = doc(db, 'expenses', id);
        await updateDoc(ref, expenseData);
        console.log('✅ Expense updated');
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        console.log('✅ Expense added');
      }
      router.replace('/');
    } catch (err) {
      console.error('❌ Save error:', err);
      Alert.alert('Error', 'Failed to save expense.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id ? 'Edit Expense' : 'Add Expense'}</Text>

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TextInput
        placeholder="Type"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />

      <Button title={id ? 'Update' : 'Save'} onPress={handleSave} />
      
      <Button
        title="Test Firebase Write"
        color="green"
        onPress={async () => {
          try {
            const testData = {
              test: true,
              timestamp: new Date(),
              userId: user?.uid ?? 'no-user',
            };
            console.log('📤 Test write:', testData);
            await addDoc(collection(db, 'expenses'), testData);
            console.log('✅ Test write success');
          } catch (e) {
            console.error('❌ Test write failed:', e);
            Alert.alert('Test Failed', e.message);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
});
