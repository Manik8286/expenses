import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Button, SectionList, StyleSheet, Text, View } from 'react-native';

export default function ExpensesListScreen() {
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const router = useRouter();

  // Group expenses by date
  const groupByDate = (expenses) => {
    const groups = {};
    expenses.forEach(exp => {
      const date = exp.date.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(exp);
    });
    // Convert to SectionList format
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // newest date first
      .map(date => ({
        title: date,
        data: groups[date],
      }));
  };

  useFocusEffect(
    useCallback(() => {
      const fetchExpenses = async () => {
        const data = await AsyncStorage.getItem('expenses');
        const expenses = data ? JSON.parse(data) : [];
        setGroupedExpenses(groupByDate(expenses));
      };
      fetchExpenses();
    }, [])
  );

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
            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Amount</Text>
              <Text style={styles.tableCellHeader}>Type</Text>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>₹{item.amount}</Text>
            <Text style={styles.tableCell}>{item.type}</Text>
            <Text style={styles.tableCell}>{item.description}</Text>
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
});
