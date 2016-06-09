var cityIds = [
  4180439,
  5128638,
  4560349,
  4726206,
  4671654,
  5809844,
  5368361,
  5391811,
  5308655,
  4684888,
  4887398,
  5391959,
  5392171,
  4164138,
  4273837,
  5746545,
  4699066,
  5419384,
  4990729
];
var cities = cityIds.join(",");
var app = angular.module('my-app', ['ngRoute']);
var markerDictionary = {};
// weather service factory.
app.factory('weather', function($http) {
  return {
    getWeatherData: function(cities, callback) {
      $http({
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/group?',
        params: {
          APPID: '24ccce52218267e8c0e1a0ba504e7ec7',
          units: 'imperial',
          id: cities
        }
      }).success(function(weatherMapData) {
          console.log( weatherMapData);
          callback(weatherMapData);
        });
    }
  };
});
app.factory('googleMap', function() {
  var mapElement = document.getElementById('map');
  var map = new google.maps.Map(mapElement, {
    center: {lat: 39.99727, lng: -94.578567},
    zoom: 4
  });
  var infoWindow = new google.maps.InfoWindow();
  function openInfoWindow(results) {
    var iconId = results.weather[0].icon;
    var cityName = results.name;
    var temperature = results.main.temp;
    var hiTemperature = results.main.temp_max;
    var lowTemperature = results.main.temp_min;
    var pressure = results.main.pressure;
    var humidity = results.main.humidity;
    var windSpeed = results.wind.speed;
    var contentString =
    '<p>' + cityName + '</br>Temp: ' + temperature + ' F</br>' + '</br>Hi-Temp: ' + hiTemperature + ' F</br>' + '</br>Low-Temp: ' + lowTemperature + ' F</br>' + '</br>Pressure: ' + pressure + ' Pa</br>' + '</br>Humidity: ' + humidity + '</br>' + '</br>Wind Speed: ' + windSpeed + ' mph</br>' + '"<a href=#/city/>' + results.id"' 'Forecast</a>';
    var marker = markerDictionary[results.id];
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
  }
  function makeMarkers(results) {
    var weatherData = results.map(function(results){
      var iconId = results.weather[0].icon;
      var position = {
        lat: results.coord.lat,
        lng: results.coord.lon
      };
      var iconBase = 'http://openweathermap.org/img/w/';
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: results.name,
        animation: google.maps.Animation. DROP,
        icon: {
          url: iconBase + iconId + '.png',
          size: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 25)
        }
      });
      markerDictionary[results.id] = marker;
      marker.addListener('click', function(){
        openInfoWindow(results);
      });
      return marker;
    });
  }
  return {
    openInfoWindow: openInfoWindow,
    makeMarkers: makeMarkers
  };
});
app.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'overview.html',
    controller: 'MainController'
  })
  .when('/forecast', {
    templateUrl: 'forecast.html',
    controller: 'ForecastController'
  });
});
//Forecat data request factory.
app.factory('weatherForecast', function($http) {
  return {
    getForecastData: function(cityId, callback) {
      $http({
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast',
        params: {
          APPID: '24ccce52218267e8c0e1a0ba504e7ec7',
          units: 'imperial',
          id: cityId
        }
      }).success(function(forecastData) {
          console.log(forecastData);
          callback(forecastData);
        });
    }
  };
});

app.controller('MainController', function($scope, $http, weather, googleMap){
  weather.getWeatherData(cities, function(weatherMapData){
    var results = weatherMapData.list;
    $scope.results = results;
    googleMap.makeMarkers(results);
  });
  $scope.openInfoWindow = function(result) {
    googleMap.openInfoWindow(result);
  };
});


app.controller('ForecastController', function($scope, $http, weatherForecast, googleMap, $routeParams) {
  var cityId = $routeParams.cityId;
  weatherForecast.getForecastData(cityId, function(forecastData) {
    var forecastResults = forecastData;
    $scope.forecastResults = forecastResults.list;
  });
});
