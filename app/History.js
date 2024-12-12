import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import styles from '../assets/styles/HistoryStyles'; // Import the separated styles
import supabase from './lib/supabaseClient';


const History = () => {
  const router = useRouter(); // Initialize the router
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
          console.error('Error fetching incidents:', error);
        } else {
          setIncidents(data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Network Error:', err);
      }
    };

    fetchIncidents();
  }, []);


  return (
       <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>HISTORY</Text>

      {/* Error Message */}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      {/* Incident History List */}
      <ScrollView contentContainerStyle={styles.historyContainer}>
        {incidents.map((incident) => (
          <View key={incident.id} style={styles.incidentCard}>
            <Text style={styles.incidentText}>Description of Incident: {incident.description}</Text>
            <Text style={styles.incidentText}>Location: {incident.location}</Text>
            <Text style={styles.incidentText}>Time & Date: {new Date(incident.date_observed).toLocaleString()}</Text>
            <Text style={styles[`status${incident.status ? incident.status.replace(' ', '') : 'Unknown'}`]}>
              Status of Report: {incident.status || 'Unknown'}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* "Report Again" Button */}
      <TouchableOpacity 
        style={styles.reportButton} 
        onPress={() => router.push('/IncidentReport')}
      >
        <Text style={styles.reportButtonText}>Report Again</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Homepages')}>
          <Icon name="home" size={25} color="#333" style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Notification')}>
          <Icon name="bell" size={25} color="#333" style={styles.navIcon} />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/History')}>
          <Icon name="history" size={25} color="#333" style={styles.navIcon} />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Profile')}>
          <Icon name="user" size={25} color="#333" style={styles.navIcon} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default History;
