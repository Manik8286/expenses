import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';

const screenWidth = Dimensions.get('window').width;

export default function ViewGraph() {
  const [chartData, setChartData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'expenses'));
        const expenses = snapshot.docs
          .map(doc => doc.data())
          .filter(item => item.uid === user?.uid);

        const categoryMap = {};

        expenses.forEach(exp => {
          if (!categoryMap[exp.type]) {
            categoryMap[exp.type] = 0;
          }
          categoryMap[exp.type] += Number(exp.amount);
        });

        const colors = [
          '#f39c12', '#e74c3c', '#8e44ad', '#2ecc71', '#3498db', '#1abc9c',
        ];

        const formattedData = Object.keys(categoryMap).map((type, index) => ({
          name: type,
          amount: categoryMap[type],
          color: colors[index % colors.length],
          legendFontColor: '#333',
          legendFontSize: 14,
        }));

        setChartData(formattedData);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };

    if (user) fetchExpenses();
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expense Distribution</Text>
      {chartData.length === 0 ? (
        <Text>No data available.</Text>
      ) : (
        <PieChart
          data={chartData.map(item => ({
            name: item.name,
            population: item.amount,
            color: item.color,
            legendFontColor: item.legendFontColor,
            legendFontSize: item.legendFontSize,
          }))}
          width={screenWidth - 32}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{
            color: () => `rgba(0, 0, 0, 1)`,
          }}
          absolute
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
