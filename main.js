//Elements of sidebar
var citysearchFormEl= document.querySelector("#citySearchForm");
var cityInputVal = document.querySelector("#inputCity");
var searchBtn = document.querySelector("#citySearch");
var popularCityListGroupEl = document.querySelector(".list-group-1");
var usersCityListEl = document.querySelector(".list-group-2");

//Elements in Weather Content Main div
var weatherContentDiv = document.querySelector("#weatherContent");
var cardDivEl = document.querySelector(".card");
var cardTitleEl = document.querySelector(".card-title");
var weatherIconEl = document.querySelector("#icon");
var uvIndexEl = document.querySelector("#uvIndex");

var openWeatherQueryUrl = "pro.openweathermap.org/data/2.5/forecast/hourly?q={city name}&appid={API key}";
var apiKey = "7efd2424f7417d8c820f58bd54c57d54";
var exisitingEntries = JSON.parse(localStorage.getItem("cities"));

var PopularCities = [""];

window.onload = function initializeDashboard() {
    if (localStorage.getItem("cities") !==null) {
        for(var i = 0; i < exisitingEntries.length; i++) {
            createNewCityButton(existingEntries[i], usersCityListGroupEl);
        }
    }
};

function handleSearch(event) {
    event.preventDefault();

    var cityInput =cityInputVal.nodeValue.trim();

    if(!cityInput) {
        errorMessage("You must enter a valid city name", searchFormEl, 3000);
        return;
    } else {
        getCurrentWeather(cityInput, apiKey);
        getForecast(cityInput, apiKey);
        cityInputVal.value = "";
        weatherContentDiv.classList.add("hide");
    }
}

searchBtn.addEventListener("click", handleSearch);

function getCurrentWeather(cityName, apiKey) {
    // For temperature in Fahrenheit and wind speed in miles/hour use units=imperial
    var url =
      openWeatherQueryUrl +
      "weather?q=" +
      cityName +
      "&appid=" +
      apiKey +
      "&units=imperial";
  
    fetch(url)
      // First we need to check that the response status is 200 before parsing the response as JSON.
      .then(function (response) {
        if (!response.ok) {
          console.log("There is an issue. Status Code: " + response.status);
          // alert invalid search to user
          errorMessage(
            "No results for " +
              cityName +
              " perhaps you mistyped... Please try again",
            weatherContentDiv,
            4000
          );
          return;
        } else {
          return response.json(); // we only get here if there is no error
        }
      })
      .then(function (weatherData) {
        console.log("Here is the object containing the current weather data");
        console.log(weatherData);
        console.log("------------------------------------------------");
        // unhide the div that the weather data will be printed out to
        weatherContentDiv.classList.remove("hide");
        // print the weather data
        displayCurrentWeather(weatherData);
  
        // save city name to local storage if it is new
        var isNew = true;
  
        if (localStorage.getItem("cities") !== null) {
          for (var i = 0; i < existingEntries.length; i++) {
            if (existingEntries[i] === weatherData.name) {
              isNew = false;
            }
          }
          for (var i = 0; i < mostPopularCities.length; i++) {
            if (mostPopularCities[i] === weatherData.name) {
              isNew = false;
            }
          }
          if (isNew) {
            existingEntries.push(weatherData.name);
            localStorage.setItem("cities", JSON.stringify(existingEntries));
            createNewCityButton(weatherData.name, usersCityListGroupEl);
          }
        } else {
          existingEntries = [];
          existingEntries.push(weatherData.name);
          localStorage.setItem("cities", JSON.stringify(existingEntries));
          createNewCityButton(weatherData.name, usersCityListGroupEl);
        }
      })
      .catch(function (error) {
        console.log("There is an error: " + error);
      });
  }
  
  // This function uses the API to grap the current UV index of the input city
  function getUVIndex(lat, lon, apiKey) {
    uvIndexQueryUrl =
      openWeatherQueryUrl + "uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
    fetch(uvIndexQueryUrl)
      .then(function (response) {
        if (!response.ok) {
          throw response.json();
        }
        return response.json();
      })
      .then(function (uvData) {
        console.log("Here is the object containing the current UV Index");
        console.log(uvData);
        console.log("------------------------------------------------");
        var uvIndex = uvData.value;
  
        // change color to indicate whether the uv conditions are favorable, moderate, or severe
        if (uvIndex <= 2) {
          colorClass = "green";
        } else if (uvIndex <= 5) {
          colorClass = "yellow";
        } else if (uvIndex <= 7) {
          colorClass = "orange";
        } else if (uvIndex <= 10) {
          colorClass = "red";
        } else if (uvIndex > 10) {
          colorClass = "violet";
        }
        document.querySelector("#uvIndex").setAttribute("class", colorClass);
        uvIndexEl.textContent = uvIndex;
      })
      .catch(function (error) {
        console.log("There is a error: " + error);
      });
  }
  
  // This function gets the 5 day forecast for the input city. It includes weather data every 3 hours.
  function getForecast(cityName, apiKey) {
    // For temperature in Fahrenheit and wind speed in miles/hour use units=imperial
    var url =
      openWeatherQueryUrl +
      "forecast?q=" +
      cityName +
      "&appid=" +
      apiKey +
      "&units=imperial";
  
    fetch(url)
      // First we need to check that the response status is 200 before parsing the response as JSON.
      .then(function (response) {
        if (!response.ok) {
          console.log("There is an issue. Status Code: " + response.status);
          return;
        } else {
          return response.json(); // we only get here if there is no error
        }
      })
      .then(function (forecastData) {
        console.log("Here is the object containing the forcast data");
        console.log(forecastData);
        // define forecastObject variable multiple times and have different property values each iteration of the loop.
        // declarare empty array
        var ourForecastObject = [];
        // iterate throughout the returned object to make an array of objects called "forecastObject" that contains only the data we want to append to the page
        for (var i = 0; i < forecastData.list.length; i++) {
          // if array iteration is divisible by 8
          if (i % 8 === 0) {
            // we will push data to object
            ourForecastObject.push({
              date: forecastData.list[i].dt_txt.split(" ")[0],
              icon: forecastData.list[i].weather[0].icon,
              iconAlt: forecastData.list[i].weather[0].description,
              temp: forecastData.list[i].main.temp,
              humidity: forecastData.list[i].main.humidity,
            });
          }
        }
        // iterate throughout "ourForecastObject" to print the forcast to the webpage
        for (var i = 0; i < ourForecastObject.length; i++) {
          var dateTitle = document.querySelectorAll(".date-title");
          var iconEl = document.querySelectorAll("#forecastIcon");
          var tempSpan = document.querySelectorAll("#tempForecast");
          var humiditySpan = document.querySelectorAll("#humidityForecast");
  
          dateTitle[i].textContent = formatDate(ourForecastObject[i].date);
          iconEl[i].setAttribute(
            "src",
            "https://openweathermap.org/img/wn/" +
              ourForecastObject[i].icon +
              "@2x.png"
          );
          iconEl[i].setAttribute("alt", ourForecastObject[i].iconAlt);
          tempSpan[i].textContent = ourForecastObject[i].temp + " °F";
          humiditySpan[i].textContent = ourForecastObject[i].humidity + "%";
        }
  
        console.log(ourForecastObject);
        console.log("------------------------------------------------");
      })
      .catch(function (error) {
        console.log("There is an error: " + error);
      });
  }
  
  function displayCurrentWeather(resultObj) {
    // show City name, date, and corresponding weather icon
    cardTitleEl.textContent =
      resultObj.name + " (" + getTodaysDate(currentDate) + ") ";
  
    // setting src and alt attribute of image
    weatherIconEl.setAttribute(
      "src",
      "https://openweathermap.org/img/wn/" + resultObj.weather[0].icon + "@2x.png"
    );
    weatherIconEl.setAttribute("alt", resultObj.weather[0].description);
    cardTitleEl.append(weatherIconEl);
  
    var tempEl = document.querySelector("#temp");
    var humidityEl = document.querySelector("#humidity");
    var windSpeedEl = document.querySelector("#windSpeed");
  
    // Adding temperature information if temperature data exists
    if (resultObj.main.temp) {
      tempEl.textContent = resultObj.main.temp + " °F";
    } else {
      tempEl.textContent = "No temperature for this city.";
    }
  
    // Adding humidity information if humidity data exists
    if (resultObj.main.humidity) {
      humidityEl.textContent = resultObj.main.humidity + "%";
    } else {
      humidityEl.textContent = "No humidity for this city.";
    }
  
    // Adding wind speed information if wind speed data exists
    if (resultObj.wind.speed) {
      windSpeedEl.textContent = resultObj.wind.speed + " MPH";
    } else {
      windSpeedEl.textContent = "No wind speed for this city.";
    }
  
    // Adding uv index data if exists
    if (resultObj.coord.lat && resultObj.coord.lon) {
      var lat = resultObj.coord.lat;
      var lon = resultObj.coord.lon;
      getUVIndex(lat, lon, apiKey);
    } else {
      uvIndexEl.textContent = "No UV index for this city.";
    }
  }
  
  // function to create new list item in the sidebar with the city's name
  function createNewCityButton(cityName, location) {
    var cityBtnEl = document.createElement("button");
    cityBtnEl.setAttribute("type", "button");
    cityBtnEl.classList.add("list-group-item", "list-group-item-action");
    cityBtnEl.textContent = cityName;
    cityBtnEl.setAttribute("value", cityName);
    location.prepend(cityBtnEl);
    cityBtnEl.addEventListener("click", function () {
      // remove active class from other buttons
      var allCityBtns = document.querySelectorAll(".list-group-item");
      for (var i = 0; i < allCityBtns.length; i++) {
        allCityBtns[i].classList.remove("active");
      }
      getCurrentWeather(cityBtnEl.value, apiKey);
      getForecast(cityBtnEl.value, apiKey);
      cityBtnEl.classList.add("active");
    });
  }
  
  
    // This custom alert box will be disappear after the time specified by the duration parameter
    setTimeout(function () {
      alertErrorDiv.parentElement.removeChild(alertErrorDiv);
    }, duration);
  
    // print the error alert under the laber "Search for a city:" so we need to target that label element
    location.prepend(alertErrorDiv);
