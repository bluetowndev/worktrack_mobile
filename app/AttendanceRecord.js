import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "@env";

const AttendanceRecord = () => {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalDistance, setTotalDistance] = useState(null);
  const [pointToPointDistances, setPointToPointDistances] = useState([]);
  const [distanceError, setDistanceError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Convert UTC to IST (simplified, assuming API sends correct timezone)
  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return new Date();
    }
    return date;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date to human-readable format (MMM DD, YYYY)
  const formatDisplayDate = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Format time to HH:MM:SS AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/user/viewAttendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch attendance records");
      }

      const recordsWithIST = data.data.map((record) => {
        const istTimestamp = convertToIST(record.timestamp);
        return {
          ...record,
          timestamp: istTimestamp,
          date: formatDate(istTimestamp),
        };
      });

      console.log('Fetched records:', recordsWithIST.map(r => ({ id: r.id, timestamp: r.timestamp })));
      setAttendanceRecords(recordsWithIST || []);
    } catch (err) {
      setError(err.message || "Failed to load attendance records");
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch daily distance for the selected date
  const fetchDailyDistance = async (date) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log('Fetching distance for date:', date);

      const response = await fetch(`${API_URL}/user/calculateDistance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      const data = await response.json();

      console.log('Distance API response:', data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch distance");
      }

      setTotalDistance(data.totalDistance);
      setPointToPointDistances(data.pointToPointDistances || []);
      setDistanceError(null);
    } catch (err) {
      console.error("Error fetching distance:", err);
      setTotalDistance(null);
      setPointToPointDistances([]);
      setDistanceError(err.message || "Failed to load distance data");
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const formattedDate = formatDate(selectedDate);
    console.log('Filtering records for date:', formattedDate);
    // Sort records by timestamp descending (newest first)
    const sortedRecords = attendanceRecords
      .filter((record) => record.date === formattedDate)
      .sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeB - timeA;
      });
    console.log('Sorted records:', sortedRecords.map(r => ({ id: r.id, timestamp: r.timestamp })));
    setFilteredRecords(sortedRecords);
    fetchDailyDistance(formattedDate);
  }, [selectedDate, attendanceRecords]);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearDateFilter = () => {
    setSelectedDate(new Date());
  };

  const renderAttendanceItem = ({ item, index }) => {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    // Find the distance for this specific attendance record by ID
    const distanceInfo = pointToPointDistances.find(d => d.attendanceId === item.id);
    const pointDistance = distanceInfo ? distanceInfo.distance : null;
    const isFirstRecord = distanceInfo ? distanceInfo.isFirst : false;

    console.log(`Rendering item ${index}:`, { 
      id: item.id, 
      pointDistance, 
      isFirstRecord,
      distanceInfo 
    });

    return (
      <Animated.View
        style={[
          styles.recordContainer,
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.recordImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.recordImage, styles.placeholderImage]}>
                <MaterialIcons
                  name="image-not-supported"
                  size={40}
                  color="#999"
                />
              </View>
            )}
          </View>
          <View style={styles.recordContent}>
            <View style={styles.recordHeader}>
              <Text style={styles.dateText}>
                {formatDate(item.timestamp)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(item.timestamp)} IST
              </Text>
            </View>
            <View style={styles.recordDetails}>
              {isFirstRecord ? (
                <View style={styles.detailRow}>
                  <MaterialIcons name="flag" size={20} color="#4CAF50" />
                  <Text style={[styles.detailText, { color: "#4CAF50" }]}>
                    First location of the day (0.00 km)
                  </Text>
                </View>
              ) : pointDistance && pointDistance !== 'N/A' ? (
                <View style={styles.detailRow}>
                  <MaterialIcons 
                    name={pointDistance === '0.00' ? "location-pin" : "directions"}
                    size={20} 
                    color={pointDistance === '0.00' ? "#4CAF50" : 
                           parseFloat(pointDistance) < 0.05 ? "#FFA500" : "#6C63FF"} 
                  />
                  <Text style={[
                    styles.detailText,
                    pointDistance === '0.00' && { color: "#4CAF50" },
                    parseFloat(pointDistance) < 0.05 && parseFloat(pointDistance) > 0 && { color: "#FFA500" }
                  ]}>
                    {pointDistance === '0.00' ? 
                      "Same location as previous (0.00 km)" :
                      `Distance from previous: ${pointDistance} km${parseFloat(pointDistance) < 0.05 ? " (minimal movement)" : ""}`
                    }
                  </Text>
                </View>
              ) : (
                <View style={styles.detailRow}>
                  <MaterialIcons name="directions" size={20} color="#999" />
                  <Text style={[styles.detailText, styles.unavailableText]}>
                    Distance unavailable
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <MaterialIcons name="flag" size={20} color="#6C63FF" />
                <Text style={styles.detailText}>Purpose: {item.purpose}</Text>
              </View>
              {item.subPurpose && item.subPurpose !== 'N/A' && (
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="subdirectory-arrow-right"
                    size={20}
                    color="#6C63FF"
                  />
                  <Text style={styles.detailText}>
                    Sub-purpose: {item.subPurpose}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <MaterialIcons name="location-pin" size={20} color="#6C63FF" />
                <Text style={styles.detailText}>
                  Location: {item.locationName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="map" size={20} color="#6C63FF" />
                <Text style={styles.detailText}>
                  Coordinates: {item.lat}, {item.lng}
                </Text>
              </View>
              {item.feedback && item.feedback !== 'N/A' && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="comment" size={20} color="#6C63FF" />
                  <Text style={styles.detailText}>
                    Feedback: {item.feedback}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#6C63FF", "#9C63FF"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Attendance Records</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color="white" />
          <Text style={styles.filterButtonText}>
            {formatDisplayDate(selectedDate)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearDateFilter}>
          <MaterialIcons name="clear" size={20} color="white" />
          <Text style={styles.clearButtonText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      {distanceError && filteredRecords.length > 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{distanceError}</Text>
        </View>
      )}

      {totalDistance !== null && filteredRecords.length > 0 && !distanceError && (
        <View style={styles.distanceContainer}>
          <MaterialIcons 
            name="directions" 
            size={20} 
            color={totalDistance < 0.1 ? "#FFA500" : "#6C63FF"} 
          />
          <Text style={[
            styles.distanceText,
            totalDistance < 0.1 && { color: "#FFA500" }
          ]}>
            Total Distance Traveled: {totalDistance.toFixed(2)} km
            {filteredRecords.length === 1 ? " (Single location)" : 
             totalDistance < 0.1 ? " (minimal movement)" : ""}
          </Text>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAttendanceRecords}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="event-busy" size={40} color="#999" />
          <Text style={styles.emptyText}>
            No attendance records for {formatDisplayDate(selectedDate)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#FFE6E6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  recordContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    height: 150,
    backgroundColor: "#F0F0F0",
  },
  recordImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
  },
  recordContent: {
    padding: 15,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  recordDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  unavailableText: {
    color: "#999",
    fontStyle: "italic",
  },
});

export default AttendanceRecord;