import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../assets/styles/IncidentReportStyles'; 
import CalendarPicker from 'react-native-calendar-picker'; 
import moment from 'moment'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import Icon from 'react-native-vector-icons/FontAwesome5'; 
import { Picker } from '@react-native-picker/picker'; 
import { supabase } from './lib/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage


  // Load session data from AsyncStorage when component mounts
  const IncidentReport = () => {
    const [location, setLocation] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [timeObserved, setTimeObserved] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isOtherLocation, setIsOtherLocation] = useState(false);
    const [room, setRoom] = useState('');
    const [floor, setFloor] = useState('1');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
  
    const handleSubmit = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .insert([
            {
              location,
              room,
              floor,
              time_observed: timeObserved,
              date_observed: selectedStartDate ? moment(selectedStartDate).format() : null,
              description,
            },
          ]);
  
        if (error) {
          console.error("Failed to insert data", error);
        } else {
          router.push('/SecIncidentReport');
        }
      } catch (error) {
        console.error("Error inserting data", error);
      }
    };

     const handleImagePicker = async (fromCamera = false) => {
        try {
          let permissionResult;
          if (fromCamera) {
            permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          } else {
            permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          }
    
          if (!permissionResult.granted) {
            Alert.alert(
              'Permission Denied',
              `Permission to access the ${fromCamera ? 'camera' : 'media library'} is required!`
            );
            return;
          }
    
          const result = fromCamera
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });
    
          if (!result.canceled) {
            const selectedImageUri = result.assets ? result.assets[0].uri : result.uri;
            setImage(selectedImageUri);
    
            // Upload the image after it's selected
            await uploadImage(selectedImageUri);  // Assuming uploadImage is an async function
          }
        } catch (error) {
          console.error('Error picking image:', error);
          Alert.alert('Error', 'An error occurred while selecting the image. Please try again.');
        } finally {
          setModalVisible(false); // Close modal after picking image
        }
      };

  const uploadImage = async (imageUri) => {
    try {
      // Step 1: Read the image file as a base64 string
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Step 2: Define file path and name
      const fileExtension = imageUri.split('.').pop(); // Get file extension
      const fileName = `incident_RE${Date.now()}.${fileExtension}`; // Create a unique file name
      const filePath = `uploads/${fileName}`; // Define folder path (optional)
  
      // Step 3: Convert Base64 to Blob for upload
      const imageBlob = {
        uri: `data:image/${fileExtension};base64,${imageData}`, // Use base64 data with MIME type
        type: `image/${fileExtension}`,
        name: fileName,
      };
  
      // Step 4: Upload image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('IMAGES') // Use your bucket name
        .upload(filePath, imageBlob, {
          contentType: `image/${fileExtension}`, // Set correct MIME type
          upsert: true,
        });
  
      if (error) {
        console.error('Error uploading image to Supabase:', error.message);
        Alert.alert('Upload Failed', 'An error occurred while uploading the image.');
        return null;
      }
  
      // Step 5: Get the public URL of the uploaded image
      const { publicURL, error: urlError } = supabase.storage
        .from('IMAGES')
        .getPublicUrl(filePath);
  
      if (urlError) {
        console.error('Error getting public URL:', urlError.message);
        Alert.alert('URL Error', 'Unable to fetch public URL of the uploaded image.');
        return null;
      }
  
      // Step 6: Return the public URL
      Alert.alert('Upload Success', 'Image uploaded successfully!');
      return publicURL; // Save or use this URL for displaying the image
    } catch (error) {
      console.error('Error uploading image:', error.message);
      Alert.alert('Error', 'An unexpected error occurred while uploading the image.');
    }
  };
     
  const handleDeleteImage = () => {
    setImage(null);
    Alert.alert('Image Removed', 'The image has been removed successfully.');
  };

  const handleDateChange = (date) => {
    setSelectedStartDate(date);
    setShowCalendar(false);
  };

  const handleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || timeObserved;
    setShowTimePicker(false);
    setTimeObserved(moment(currentDate).format('HH:mm'));
  };

  const handleLocationChange = (value) => {
    if (value === 'Others') {
      setIsOtherLocation(true);
    } else {
      setIsOtherLocation(false);
    }
    setLocation(value);
    AsyncStorage.setItem('location', value); // Save location to AsyncStorage
  };

  const handleRoomChange = (value) => {
    setRoom(value);
    AsyncStorage.setItem('room', value); // Save room to AsyncStorage
  };

  const handleFloorChange = (value) => {
    setFloor(value);
    AsyncStorage.setItem('floor', value); // Save floor to AsyncStorage
  };

  const locationOptions = [
    { label: 'Architecture and Fine Arts (CAFA)', value: 'Architecture and Fine Arts (CAFA)' },
    { label: 'Architecture and Fine Arts (CAFA)', value: 'Architecture and Fine Arts (CAFA)' },
    { label: 'Arts and Sciences (CAS)', value: 'Arts and Sciences (CAS)' },
    { label: 'Business and Accountancy (CBA)', value: 'Business and Accountancy (CBA)' },
    { label: 'Computing and Multimedia Studies (CCMS)', value: 'Computing and Multimedia Studies (CCMS)' },
    { label: 'Criminal Justice and Criminology (CCJC)', value: 'Criminal Justice and Criminology (CCJC)' },
    { label: 'Education (CEd)', value: 'Education (CEd)' },
    { label: 'Engineering (CEng)', value: 'Engineering (CEng)' },
    { label: 'Maritime Studies (CME)', value: 'Maritime Studies (CME)' },
    { label: 'Physical Education and Sports (IPES)', value: 'Physical Education and Sports (IPES)' },
    { label: 'International Hospitality and Tourism Management (CIHTM)', value: 'International Hospitality and Tourism Management (CIHTM)' },
    { label: 'Basic Education Department (BED)', value: 'Basic Education Department (BED)' },
    { label: 'Gymnasium', value: 'Gymnasium' },
    { label: 'Library', value: 'Library' },
    { label: 'Main Canteen', value: 'Main Canteen' },
    { label: 'BEd Canteen', value: 'BEd Canteen' },
    { label: 'Swimming Pool', value: 'Swimming Pool' },
    { label: 'Gate 1 Parking Lot', value: 'Gate 1 Parking Lot' },
    { label: 'Gate 2 Parking Lot', value: 'Gate 2 Parking Lot' },
    { label: 'Gate 3 Parking Lot', value: 'Gate 3 Parking Lot' },
    { label: 'Tennis Court', value: 'Tennis Court' },
    { label: 'Student Lounge', value: 'Student Lounge' },
    { label: 'iLounge', value: 'iLounge' },
    { label: 'BEd Covered Court', value: 'BEd Covered Court' },
    { label: 'Main Covered Court', value: 'Main Covered Court' },
    { label: 'AEC Little Theater', value: 'AEC Little Theater' },
    { label: 'Banyuhay Bridge', value: 'Banyuhay Bridge' },
    { label: 'Others', value: 'Others' }
    // Add other options here
  ];

  // Sort the options alphabetically and ensure "Others" is at the end
  const sortedLocationOptions = locationOptions.sort((a, b) => {
    if (a.value === 'Others') return 1; // 'Others' should be last
    if (b.value === 'Others') return -1; // 'Others' should be last
    return a.label.localeCompare(b.label); // Alphabetical sorting
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false} // Hide the scrollbar indicator
        >
          {/* Form Fields */}
          <Text style={styles.headerText}>Incident Report Form</Text>
          <Text style={styles.subHeaderText}>Nature Of Hazard</Text>
          <Text style={styles.label}>Location</Text>

          {/* Location Dropdown */}
          <Picker
            selectedValue={location}
            style={styles.picker}
            onValueChange={handleLocationChange}>
            {sortedLocationOptions.map((option) => (
              <Picker.Item label={option.label} value={option.value} key={option.value} />
            ))}
          </Picker>

          {/* Input for Other Location if 'Others' is selected */}
          {isOtherLocation ? (
            <TextInput
              style={styles.input}
              placeholder="Enter Custom Location"
              value={location}
              onChangeText={(value) => {
                setLocation(value);
                AsyncStorage.setItem('location', value); // Save to AsyncStorage
              }}
            />
          ) : (
            <>
              {/* Room input */}
              <Text style={styles.label}>Room</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Room"
                value={room}
                onChangeText={handleRoomChange}
              />

              {/* Floor dropdown */}
              <Text style={styles.label}>Floor</Text>
              <Picker
                selectedValue={floor}
                style={styles.picker}
                onValueChange={handleFloorChange}>
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
              </Picker>
            </>
          )}

          {/* Date Picker */}
          <Text style={styles.label}>Date</Text>
          <TouchableWithoutFeedback onPress={() => setShowCalendar(true)}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputText}>
                {selectedStartDate ? moment(selectedStartDate).format('MM/DD/YYYY') : 'Enter Date'}
              </Text>
              <Image
                source={require('../assets/icons/Calendar.png')}
                style={styles.calendarIcon}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Time Picker */}
          <Text style={styles.labelTime}>Time of Observation</Text>
          <TouchableWithoutFeedback onPress={() => setShowTimePicker(true)}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputText}>
                {timeObserved ? timeObserved : 'Enter Time'}
              </Text>
              <Image
                source={require('../assets/icons/Clock-icon.png')}
                style={styles.calendarIcon}
              />
            </View>
          </TouchableWithoutFeedback>


          <Text style={styles.subHeaderText}>Other Details:</Text>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Enter Description"
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.exampleText}>Eg. slippery floor, exposed wiring, broken equipment</Text>

          <Text style={styles.label}>Photographic Evidence</Text>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={() => setModalVisible(true)}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <Text style={styles.imageUploadText}>Tap to select or capture an image</Text>
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity style={styles.deleteImageButton} onPress={handleDeleteImage}>
              <Icon name="trash" size={20} color="#FFF" />
              <Text style={styles.deleteImageButtonText}>Delete Image</Text>
            </TouchableOpacity>
          )}

          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Image Source</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleImagePicker(true)}
                >
                  <Icon name="camera" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>Take a Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleImagePicker(false)}
                >
                  <Icon name="images" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent={true} animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.calendarModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
            <View style={styles.calendarModalClose} />
          </TouchableWithoutFeedback>
          <CalendarPicker
            onDateChange={handleDateChange}
            selectedStartDate={selectedStartDate}
          />
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent={true} animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.timeModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
            <View style={styles.timeModalClose} />
          </TouchableWithoutFeedback>
          <DateTimePicker
            mode="time"
            value={new Date()}
            display="default"
            onChange={handleTimeChange}
          />
        </View>
      </Modal>
    </View>
  );
};

export default IncidentReport;
