import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'
import axios from 'axios'

const GOOGLE_MAPS_APIKEY = 'AIzaSyCrj0dPXfMtlzups3cubr7lYb7muPP6zVs'
const WEATHERBIT_APIKEY = '469bc9df9a824b2f869355d8683ff065'

export default function App() {

  const [weatherData, setWeatherData] = useState(null)
  const [isDay, setIsDay] = useState(null)

  const [location, setLocation] = useState(null)
  const [placeName, setPlaceName] = useState(null)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return;
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)

      //Google Maps Geocoding API to get place name from coordinates
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((json) => {
          
          if (json.status === 'OK') {
            setPlaceName(json.results[0].formatted_address)
          } else {
            setPlaceName('Unknown')
          }
        })
        .catch((error) => {
          console.error(error);
          setPlaceName('Unknown')
        });

        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        let result = geocode[0]
        if (result) {
          setPlaceName(result.formattedAddress)
        }
    
        

    })();
  }, []);
  
  useEffect(() => {

    if (location && placeName) {
      getWeatherData(location.coords.latitude, location.coords.longitude)
    }
  
  }, [placeName])
  
  //Get data from WheatherBit API
  async function getWeatherData(latitude, longitude) {

    try {
      let url = `https://api.weatherbit.io/v2.0/current?key=${WEATHERBIT_APIKEY}`
      if (latitude && longitude) {
        url += `&lat=${latitude}&lon=${longitude}`;
      }
      const response = await axios.get(url)
      const weatherData = response.data.data[0]

      setWeatherData(weatherData)
      setIsDay(weatherData.pod === 'd')
    } catch (error) {
      console.error(error)
    }

  }

  if (!weatherData) {
    return (
      <View style={[styles.container, { backgroundColor: '#356fdd'}]}>
        <Text style={styles.text}>Getting Weather Data</Text>
        <StatusBar style="auto" />
      </View>
    )
  }

  const weatherIconUrl = `https://www.weatherbit.io/static/img/icons/${weatherData.weather.icon}.png`;

  return (
    <View style={[styles.container, { backgroundColor: isDay ? '#356fdd' : '#030d1f' }]}>
      <Image source={{ uri: weatherIconUrl }} style={styles.weatherIcon} />
      <Text style={styles.weatherDataPlace}>{weatherData.city_name}, {weatherData.country_code}</Text>
      <Text style={styles.weatherDataTemp}>{weatherData.temp}°C</Text>
      <Text style={styles.weatherDataDesc}>{weatherData.weather.description}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => getWeatherData(location.coords.latitude, location.coords.longitude)}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  weatherDataPlace: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30
  },
  weatherDataTemp: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 60
  },
  weatherDataDesc: {
    color: '#fff',
    fontSize: 20,
  },
  weatherIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    backgroundColor: '#fff',
    color: '#030d1f',
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30
  },
});


