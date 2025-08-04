import { useFocusEffect, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { Alert, Button, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';

export default function ExpensesListScreen() {
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  console.log('👤 Current user:', user);

  const groupByDate = (expenses) => {
    const groups = {};
    expenses.forEach(exp => {
      const date = exp.date?.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(exp);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({ title: date, data: groups[date] }));
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, snapshot => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroupedExpenses(groupByDate(expenses));
      });

      return () => unsubscribe();
    }, [user])
  );

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      Alert.alert('Error', 'Could not delete expense.');
      console.error('Delete error:', error);
    }
  };

  // 🔐 If no user, show login fallback
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're not logged in</Text>
        <Button title="Go to Login" onPress={() => router.push('/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <Button title="Add Expense" onPress={() => router.push('/add-expense')} />
      <Button title="View Graph" onPress={() => router.push('/view-graph')} />
      <SectionList
        sections={groupedExpenses}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View>
            <Text style={styles.sectionHeader}>{title}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Amount</Text>
              <Text style={styles.tableCellHeader}>Type</Text>
              <Text style={styles.tableCellHeader}>Description</Text>
              <Text style={styles.tableCellHeader}>Actions</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>₹{item.amount}</Text>
            <Text style={styles.tableCell}>{item.type}</Text>
            <Text style={styles.tableCell}>{item.description}</Text>
            <View style={styles.actionsCell}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/add-expense', params: { id: item.id } })}
              >
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No expenses yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: 6, marginTop: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e0e0e0', paddingVertical: 4 },
  tableCellHeader: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 6 },
  tableCell: { flex: 1, textAlign: 'center' },
  actionsCell: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  edit: { color: 'blue' },
  delete: { color: 'red' },
});
