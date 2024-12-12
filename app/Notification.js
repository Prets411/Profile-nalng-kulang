import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Import FontAwesome5 icons
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { supabase } from './lib/supabaseClient';
import styles from '../assets/styles/NotificationStyles'; // Import styles

const Notification = () => {  
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications...');
        
        // Fetch announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
  
        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false });
  
        // Handle any errors from announcements or programs
        if (announcementsError || programsError) {
          setError(announcementsError?.message || programsError?.message);
          console.error('Error fetching notifications:', announcementsError || programsError);
        } else {
          // Combine the data from both sources
          const combinedData = [...announcementsData, ...programsData];
  
          // Optionally sort combined data by 'created_at' (if necessary)
          combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
          setNotifications(combinedData);
        }
      } catch (err) {
        setError(err.message);
        console.error('Network Error:', err);
      }
    };
  
    fetchNotifications();
  }, []);
  

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.separator} />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.notificationContainer}>
      {notifications.map((notification, index) => (
      <View
      key={`${notification.id}-${index}`} // Ensure unique keys
      style={[
        styles.notificationItem,
        { backgroundColor: notification.color },
      ]}
      >
      <View style={styles.notificationIconCircle}>
        {/* Display Image if available, otherwise fallback to Icon */}
      </View>
      <View style={styles.notificationDetails}>
        <View style={styles.notificationText}>
          {/* Display Title */}
          {notification.title && (
            <Text>{notification.title}</Text>
          )}
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.created_at).toLocaleString()}
          </Text>
        </View>
      </View>
      </View>
        ))}
      </ScrollView>


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

export default Notification;