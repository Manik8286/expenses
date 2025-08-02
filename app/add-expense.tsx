import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { app } from '../firebaseConfig'; // adjust path

const db = getFirestore(app);

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('cash');
  const [description, setDescription] = useState('');

  const handleAddExpense = async () => {
    if (!amount) {
      Alert.alert('Please enter an amount');
      return;
    }
    try {
      await addDoc(collection(db, 'expenses'), {
        amount: Number(amount), // Ensure amount is stored as a number
        type,
        description,
        date: new Date().toISOString(),
      });
      Alert.alert('Expense saved!');
      setAmount('');
      setDescription('');
      setType('cash');
    } catch (e) {
      Alert.alert('Failed to save expense');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
      />
      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        style={styles.input}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        <Picker.Item label="Cash" value="cash" />
        <Picker.Item label="UPI" value="upi" />
        <Picker.Item label="Credit Card" value="creditcard" />
      </Picker>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />
      <Button title="Add Expense" onPress={handleAddExpense} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginTop: 4 },
});