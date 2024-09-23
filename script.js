class WeatherPeriod {
  constructor(
    temp,
    feelsLikeTemp,
    humidity,
    precipType,
    precipChance,
    dateTime
  ) {
    this.temp = temp;
    this.feelsLikeTemp = feelsLikeTemp;
    this.humidity = humidity;
    this.precipType = precipType;
    this.precipChance = precipChance;
    this.dateTime = dateTime;
  }
}

// Make an API call to visualCrossing.com, to get weather data for location
async function fetchDataForLocation(location) {
  const encodedLocation = encodeURIComponent(location);
  const APIKey = "7PPG972PE46VHJ8E93N7NMFJ9";
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodedLocation}?unitGroup=us&key=${APIKey}&contentType=json`;
  const response = await fetch(url, { mode: "cors" });
  const locData = await response.json();

  const processedData = processWeatherData(locData);
  console.log(processedData);
  return processedData;
}

// Process visualCrossing.com API response data to get
// temp, humidity, feelsLike, precipType, precipProb, and dateTime for:
// processedData.currentConditions (single object)
// processedData.hourly (array of size 24)
// processedData.daily (array of size 7)
function processWeatherData(JSONData) {
  let processedData = { currentConditions: {}, hourly: [], daily: [] };

  //Get current conditions
  processedData.currentConditions = {
    temp: JSONData.currentConditions.temp,
    humidity: JSONData.currentConditions.humidity,
    feelsLike: JSONData.currentConditions.feelslike,
    precipType: JSONData.currentConditions.preciptype,
    precipProb: JSONData.currentConditions.precipprob,
    dateTime: "current",
  };

  //Get hourly for current day
  JSONData.days[0].hours.forEach((hour) => {
    const filteredHour = {
      temp: hour.temp,
      feelsLike: hour.feelslike,
      humidity: hour.humidity,
      precipType: hour.preciptype,
      precipProb: hour.precipprob,
      dateTime: hour.datetime,
    };

    processedData.hourly.push(filteredHour);
  });

  //Get next 7 days, including today
  for (day = 0; day < 7; day++) {
    const filteredDay = {
      temp: JSONData.days[day].temp,
      feelsLike: JSONData.days[day].feelslike,
      humidity: JSONData.days[day].humidity,
      precipType: JSONData.days[day].preciptype,
      precipprob: JSONData.days[day].precipprob,
      dateTime: JSONData.days[day].datetime,
    };

    processedData.daily.push(filteredDay);
  }

  return processedData;
}

// Make an API call to giphy, to get an animated gif for searchString
async function getGIFs(searchString) {
  const encodedSearchString = encodeURIComponent(searchString);
  const APIKey = "M1MWiTS051NXTyIRhtHJx7LnevUUfAVK";
  const url = `https://api.giphy.com/v1/gifs/translate?api_key=${APIKey}&s=${encodedSearchString}`;
  const response = await fetch(url, { mode: "cors" });
  const gifData = await response.json();

  console.log(gifData);
  return gifData;
}

fetchDataForLocation("charlotte");
