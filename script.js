class WeatherPeriod {
  constructor(
    temp,
    feelsLikeTemp,
    humidity,
    precipType,
    precipChance,
    icon,
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
    this.icon = icon;
    this.dateTime = dateTime;
  }
}

// Make an API call to visualCrossing.com, to get weather data for location
async function fetchDataForLocation(location) {
  const encodedLocation = encodeURIComponent(location);
  const APIKey = "7PPG972PE46VHJ8E93N7NMFJ9";
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodedLocation}?unitGroup=us&key=${APIKey}&contentType=json&iconSet=icons2`;
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
    JSONData.currentConditions.icon,
    "Current"
  );

  //Get hourly for current day
  JSONData.days[0].hours.forEach((hour) => {
    const filteredHour = new WeatherPeriod(
      hour.temp,
      hour.feelslike,
      hour.humidity,
      hour.preciptype,
      hour.precipprob,
      hour.icon,
      convertHourlyTo12HourFormat(hour.datetime)
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
      JSONData.days[day].icon,
      convertDailyToDayOfWeekFormat(JSONData.days[day].datetime)
    );

    processedData.daily.push(filteredDay);
  }

  return processedData;
}

async function submitSearch(event) {
  const textField = document.getElementById("location-input");
  const inputString = textField.value.trim();
  if (inputString == "") {
    return;
  }

  event.preventDefault();
  try {
    const processedWeatherData = await fetchDataForLocation(inputString);
    console.log(processedWeatherData.currentConditions);
    clearDOMContent();
    createDOMCurrent(processedWeatherData.currentConditions);
    createDOMHourly(processedWeatherData.hourly);
    createDOMDaily(processedWeatherData.daily);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

//Assuming input of the form "hh:mm:ss"
function convertHourlyTo12HourFormat(timeString) {
  const [hours, minutes, seconds] = timeString.split(":");
  let hour = parseInt(hours);
  const amOrPm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12;

  // Return the time in "12 am" or "4 pm" format
  return `${hour} ${amOrPm}`;
}

//Assuming input of the form "yyyy-mm-dd"
function convertDailyToDayOfWeekFormat(dateString) {
  const localDate = new Date(dateString);

  return localDate.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }); // "Mon", "Tue", etc.
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

function clearDOMContent() {
  currentContent.innerHTML = "";
  hourlyContent.innerHTML = "";
  weeklyContent.innerHTML = "";
}

function createDOMWeatherEntry(weatherPeriod, containerDiv) {
  // https://www.visualcrossing.com/resources/documentation/weather-api/defining-icon-set-in-the-weather-api/
  let summary = "Cloudy";
  if (
    weatherPeriod.icon == "thunder-rain" ||
    weatherPeriod.icon == "thunder-showers-day" ||
    weatherPeriod.icon == "thunder-shows-night"
  ) {
    summary = "Thunderstorms";
  } else if (
    weatherPeriod.icon == "snow" ||
    weatherPeriod.icon == "snow-showers-day" ||
    weatherPeriod.icon == "snow-showers-night"
  ) {
    summary = "Snow";
  } else if (
    weatherPeriod.icon == "rain" ||
    weatherPeriod.icon == "showers-day" ||
    weatherPeriod.icon == "showers-night"
  ) {
    summary = "Rain";
  } else if (
    weatherPeriod.icon == "clear-day" ||
    weatherPeriod.icon == "clear-night"
  ) {
    summary = "Sunny";
  }

  const precipType =
    weatherPeriod.precipType == null ? "None" : weatherPeriod.precipType;
  const newWeatherEntryDiv = document.createElement("div");
  newWeatherEntryDiv.classList.add("weather-entry");
  newWeatherEntryDiv.innerHTML = `
            <div class="weather-icon">
              <img src="Assets/${summary}Icon.png" alt="Sun Icon" />
            </div>
            <div class="weather-info">
              <div class="primary-info">
                <div class="summary">${summary}</div>              
                <div class="temperature">${weatherPeriod.temp}°F</div>
              </div>
              <div class="additional-info">
                <div class="precipitation-type">Precipitation: ${precipType}</div>
                <div class="precipitation-chance">Chance: ${weatherPeriod.precipChance}%</div>
                <div class="humidity">Humidity: ${weatherPeriod.humidity}%</div>
              </div>
            </div>
            <div class="date-time">${weatherPeriod.dateTime}</div>`;

  containerDiv.appendChild(newWeatherEntryDiv);
}

function createDOMCurrent(currentConditions) {
  createDOMWeatherEntry(currentConditions, currentContent);
}

function createDOMHourly(hourlyConditions) {
  hourlyConditions.forEach((hour) => {
    createDOMWeatherEntry(hour, hourlyContent);
  });
}

function createDOMDaily(dailyConditions) {
  dailyConditions.forEach((day) => {
    createDOMWeatherEntry(day, weeklyContent);
  });
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
