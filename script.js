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
    if (Array.isArray(precipType)) {
      this.precipType = precipType[0];
    } else {
      this.precipType = null;
    }
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
  processedData.currentConditions = new WeatherPeriod(
    JSONData.currentConditions.temp,
    JSONData.currentConditions.humidity,
    JSONData.currentConditions.feelslike,
    JSONData.currentConditions.preciptype,
    JSONData.currentConditions.precipprob,
    "current"
  );

  //Get hourly for current day
  JSONData.days[0].hours.forEach((hour) => {
    const filteredHour = new WeatherPeriod(
      hour.temp,
      hour.feelslike,
      hour.humidity,
      hour.preciptype,
      hour.precipprob,
      hour.datetime
    );

    processedData.hourly.push(filteredHour);
  });

  //Get next 7 days, including today
  for (day = 0; day < 7; day++) {
    const filteredDay = new WeatherPeriod(
      JSONData.days[day].temp,
      JSONData.days[day].feelslike,
      JSONData.days[day].humidity,
      JSONData.days[day].preciptype,
      JSONData.days[day].precipprob,
      JSONData.days[day].datetime
    );

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

const currentTab = document.getElementById("current-tab");
const hourlyTab = document.getElementById("hourly-tab");
const weeklyTab = document.getElementById("weekly-tab");
const currentContent = document.getElementById("current");
const hourlyContent = document.getElementById("hourly");
const weeklyContent = document.getElementById("weekly");

function showTab(tab) {
  currentContent.classList.remove("active");
  hourlyContent.classList.remove("active");
  weeklyContent.classList.remove("active");
  currentTab.classList.remove("active");
  hourlyTab.classList.remove("active");
  weeklyTab.classList.remove("active");

  if (tab === "current") {
    currentContent.classList.add("active");
    currentTab.classList.add("active");
  } else if (tab === "hourly") {
    hourlyContent.classList.add("active");
    hourlyTab.classList.add("active");
  } else if (tab === "weekly") {
    weeklyContent.classList.add("active");
    weeklyTab.classList.add("active");
  }
}

function submitSearch(event) {
  const textField = document.getElementById("location-input");
  const inputString = textField.value.trim();
  if (inputString == "") {
    return;
  }

  const processedWeatherData = fetchDataForLocation(inputString);
  console.log(processedWeatherData);
  event.preventDefault();
}

// called exactly once - adds event listeners
function initialize() {
  const searchBtn = document.querySelector("#location-form button");

  searchBtn.addEventListener("click", (event) => {
    submitSearch(event);
  });

  currentTab.addEventListener("click", () => {
    showTab("current");
  });

  hourlyTab.addEventListener("click", () => {
    showTab("hourly");
  });

  weeklyTab.addEventListener("click", () => {
    showTab("weekly");
  });
}

initialize();
