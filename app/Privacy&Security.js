import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for back icon
import styles from '../assets/styles/PrivacySecurityStyles'; // Import the separated styles

const PrivacySecurity = () => {
  const router = useRouter(); // Initialize the router

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/')} // Navigate to index.js (home)
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Privacy and Security Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <Text style={styles.heading}>Privacy and Security</Text>
          <Text style={styles.paragraph}>
            HALA!RMA is committed to protecting the privacy and security of the university community. The app is designed to optimize the communication of critical information during emergencies, ensuring that the right information reaches the right people in real-time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Data Collection</Text>
          <Text style={styles.paragraph}>
            HALA!RMA collects minimal user data necessary to send timely updates during emergencies. User data is encrypted and used solely for improving safety protocols and ensuring prompt communication.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Real-time Updates</Text>
          <Text style={styles.paragraph}>
            All communications sent through HALA!RMA are encrypted and follow strict security protocols. No third-party services are used without user consent, and all data transmission occurs over secure channels.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>User Consent</Text>
          <Text style={styles.paragraph}>
            Before using HALA!RMA, users are prompted to agree to our privacy policy. No personal information is shared or used for non-emergency purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Emergency Communication</Text>
          <Text style={styles.paragraph}>
            During critical events, HALA!RMA ensures that safety measures and warnings are delivered promptly to all users. The app is built to prioritize user security and avoid delays in important notifications.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySecurity;
