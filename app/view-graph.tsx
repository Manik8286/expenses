import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  collection,
  getDocs
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';

const screenWidth = Dimensions.get('window').width;

export default function ViewGraph() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [totalAmount, setTotalAmount] = useState(0);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, filterType, startDate, endDate, year]);

  const fetchExpenses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      let expenses = snapshot.docs
        .map((doc) => doc.data())
        .filter((item) => item.userId === user?.uid);

      // Filter
      if (filterType) {
        expenses = expenses.filter((e) => e.type === filterType);
      }
      if (year) {
        expenses = expenses.filter((e) =>
          e.date?.startsWith(year)
        );
      }
      if (startDate && endDate) {
        expenses = expenses.filter(
          (e) => e.date >= startDate && e.date <= endDate
        );
      }

      // Sum total
      const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
      setTotalAmount(total);

      // Group by category or subcategory
      const grouped: { [key: string]: number } = {};
      for (const e of expenses) {
        const key = e.subtype ? `${e.type} → ${e.subtype}` : e.type;
        grouped[key] = (grouped[key] || 0) + Number(e.amount);
      }

      const colors = [
        '#f39c12', '#e74c3c', '#8e44ad', '#2ecc71', '#3498db', '#1abc9c',
      ];

      const formatted = Object.keys(grouped).map((key, index) => ({
        name: key,
        amount: grouped[key],
        color: colors[index % colors.length],
        legendFontColor: '#333',
        legendFontSize: 14,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const renderChart = () => {
    const chartCommonProps = {
      width: screenWidth - 32,
      height: 240,
      chartConfig: {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: () => `rgba(0, 0, 0, 1)`,
        labelColor: () => '#333',
      },
    };

    const labels = chartData.map((d) => d.name);
    const dataPoints = chartData.map((d) => d.amount);

    if (chartType === 'pie') {
      return (
        <PieChart
          data={chartData.map((d) => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: d.legendFontColor,
            legendFontSize: d.legendFontSize,
          }))}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          {...chartCommonProps}
        />
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart
          data={{
            labels,
            datasets: [{ data: dataPoints }],
          }}
          {...chartCommonProps}
          fromZero
        />
      );
    } else if (chartType === 'line') {
      return (
        <LineChart
          data={{
            labels,
            datasets: [{ data: dataPoints }],
          }}
          {...chartCommonProps}
        />
      );
    }
  };

  const exportAsCSV = async () => {
    const header = 'Type,Amount\n';
    const rows = chartData.map((d) => `${d.name},${d.amount}`).join('\n');
    const csv = header + rows;

    const path = FileSystem.documentDirectory + 'expenses.csv';
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path);
    } else {
      alert('Sharing not available');
    }
  };

  const exportAsPDF = async () => {
    const html = `
      <h1>Expense Summary</h1>
      <ul>
        ${chartData.map((d) => `<li>${d.name}: ₹${d.amount}</li>`).join('')}
      </ul>
      <strong>Total: ₹${totalAmount}</strong>
    `;
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      alert('Sharing not available');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expense Graph</Text>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Filter Type"
          value={filterType}
          onChangeText={setFilterType}
          style={styles.input}
        />
        <TextInput
          placeholder="Year (e.g. 2025)"
          value={year}
          onChangeText={setYear}
          style={styles.input}
        />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          style={styles.input}
        />
        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          style={styles.input}
        />
      </View>

      {/* Chart Toggle */}
      <View style={styles.filterRow}>
        {['pie', 'bar', 'line'].map((t) => (
          <Button
            key={t}
            title={t.toUpperCase()}
            onPress={() => setChartType(t as any)}
          />
        ))}
      </View>

      {/* Chart */}
      {chartData.length > 0 ? renderChart() : <Text>No data available.</Text>}

      {/* Summary */}
      <Text style={styles.total}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>

      {/* Export Buttons */}
      <View style={styles.exportRow}>
        <Button title="Export CSV" onPress={exportAsCSV} />
        {Platform.OS !== 'web' && <Button title="Export PDF" onPress={exportAsPDF} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    margin: 4,
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  total: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
});
