import requests
import datetime
import json

# BASE_URL = "http://localhost:8001/"
# BASE_URL = "/"
# Constants
MATCHES_URL = f"http://localhost:8001/api/matches9days"
WEATHER_API_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=63.405074&lon=10.392409"

headers = {
    "User-Agent": "TSFF/1.0 (petter.lauvrak@hotmail.com)",  # Replace with your app's name and contact email
}

# Fetch matches for the next 9 days
response = requests.get(MATCHES_URL)
matches = response.json()


# Fetch weather for the next 9 days
response = requests.get(WEATHER_API_URL, headers=headers)
met_data = response.json()

timeseries = met_data["properties"]["timeseries"]


def get_closest_weather(ko_time):
    # Convert the ko_time string to a datetime object
    ko_datetime = datetime.datetime.strptime(ko_time, "%Y-%m-%dT%H:%M:%S%z")

    # Initialize variables to keep track of the closest timestamp and its index
    closest_time_diff = float("inf")
    closest_index = -1

    # Loop through the timeseries to find the closest timestamp
    for index, entry in enumerate(timeseries):
        time_str = entry["time"]
        time_datetime = datetime.datetime.strptime(
            time_str, "%Y-%m-%dT%H:%M:%SZ"
        ).replace(tzinfo=datetime.timezone.utc)
        time_diff = abs((ko_datetime - time_datetime).total_seconds())

        if time_diff < closest_time_diff:
            closest_time_diff = time_diff
            closest_index = index

    # Extract the relevant weather data from the closest timestamp
    if closest_index != -1:
        data = timeseries[closest_index]["data"]
        weather_data = data["instant"]["details"]
        weather_icon = None
        precipitation = None
        if "next_1_hours" in data:
            weather_icon = data["next_1_hours"]["summary"]["symbol_code"]
            precipitation = data["next_1_hours"]["details"]["precipitation_amount"]
        elif "next_6_hours" in data:  # If not, check if 'next_6_hours' is available
            weather_icon = data["next_6_hours"]["summary"]["symbol_code"]
            precipitation = data["next_6_hours"]["details"]["precipitation_amount"]
        elif "next_12_hours" in data:  # If not, check if 'next_12_hours' is available
            weather_icon = data["next_12_hours"]["summary"]["symbol_code"]
            precipitation = data["next_12_hours"]["details"]["precipitation_amount"]

        return {
            "air_temperature": weather_data["air_temperature"],
            "cloud_area_fraction": weather_data["cloud_area_fraction"],
            "wind_speed": weather_data["wind_speed"],
            "precipitation": precipitation,
            "weather_icon": weather_icon,
        }

    else:
        return None


# Fetch weather data for each match and prepare the update payload
weather_updates = {}
for match in matches:
    match_date = match["ko_time"]
    weather_updates[match["match_id"]] = get_closest_weather(match_date)


# Send the weather updates to the /weatherupdate endpoint
response = requests.post(f"{BASE_URL}api/admin/weatherupdate", json=weather_updates)
if response.status_code == 200:
    print(f"{datetime.datetime.now()}: Weather data updated successfully!")
else:
    print(f"{datetime.datetime.now()}: Error updating weather data: {response.text}")
