import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const GRAPH_MODES = [
  { label: 'By Description', value: 'description' },
  { label: 'By Date', value: 'date' },
  { label: 'By Type', value: 'type' },
];

const CHART_TYPES = [
  { label: 'Bar Chart', value: 'bar' },
  { label: 'Pie Chart', value: 'pie' },
];

export default function ViewGraphScreen() {
  const [mode, setMode] = useState('description');
  const [chartType, setChartType] = useState('bar');
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const raw = await AsyncStorage.getItem('expenses');
      const expenses = raw ? JSON.parse(raw) : [];
      let totals = {};
      if (mode === 'description') {
        expenses.forEach(exp => {
          const desc = exp.description || 'No Description';
          totals[desc] = (totals[desc] || 0) + Number(exp.amount);
        });
      } else if (mode === 'date') {
        expenses.forEach(exp => {
          const date = exp.date.slice(0, 10);
          totals[date] = (totals[date] || 0) + Number(exp.amount);
        });
      } else if (mode === 'type') {
        expenses.forEach(exp => {
          const type = exp.type || 'Unknown';
          totals[type] = (totals[type] || 0) + Number(exp.amount);
        });
      }
      const sortedKeys = Object.keys(totals).sort();
      setLabels(sortedKeys);
      setData(sortedKeys.map(key => totals[key]));
    };
    fetchExpenses();
  }, [mode]);

  // Prepare data for PieChart
  const pieData = labels.map((label, i) => ({
    name: label,
    amount: data[i],
    color: `hsl(${i * 60}, 70%, 60%)`,
    legendFontColor: "#333",
    legendFontSize: 14,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expenses Graph</Text>
      <View style={{ width: '100%', marginBottom: 8 }}>
        <Picker
          selectedValue={mode}
          onValueChange={setMode}
          style={{ width: '100%' }}
        >
          {GRAPH_MODES.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
      <View style={{ width: '100%', marginBottom: 16 }}>
        <Picker
          selectedValue={chartType}
          onValueChange={setChartType}
          style={{ width: '100%' }}
        >
          {CHART_TYPES.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
      {labels.length > 0 ? (
        chartType === 'bar' ? (
          <BarChart
            data={{
              labels,
              datasets: [{ data }],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(244, 81, 30, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <PieChart
            data={pieData.map(d => ({
              name: d.name,
              population: d.amount,
              color: d.color,
              legendFontColor: d.legendFontColor,
              legendFontSize: d.legendFontSize,
            }))}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              color: () => "#888",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="16"
            absolute
          />
        )
      ) : (
        <Text>No expenses to show.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
});