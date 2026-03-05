import os
import wifi
import adafruit_requests
import adafruit_connection_manager
import json
import time

print("Connecting to WiFi...")

try:
    wifi.radio.connect(
        os.getenv("CIRCUITPY_WIFI_SSID"),
        os.getenv("CIRCUITPY_WIFI_PASSWORD")
    )
    print("Connected!")
    print("IP address:", wifi.radio.ipv4_address)
except Exception as e:
    print("WiFi connection failed:", e)
    while True:
        pass

pool = adafruit_connection_manager.get_radio_socketpool(wifi.radio)
ssl_context = adafruit_connection_manager.get_radio_ssl_context(wifi.radio)
requests = adafruit_requests.Session(pool, ssl_context)

PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
SECRET = os.getenv("FIREBASE_SECRET")

BASE_URL = f"https://{PROJECT_ID}-default-rtdb.firebaseio.com"
AUTH_PARAM = f"?auth={SECRET}"

write_url = f"{BASE_URL}/test.json{AUTH_PARAM}"

data_to_send = {
    "device": "circuitpython_board",
    "status": "online",
}

print("\nSending data to Firebase...")

try:
    with requests.put(write_url, data=json.dumps(data_to_send)) as response:
        print("Write Status:", response.status_code)
        print("Write Response:", response.text)
except Exception as e:
    print("Write failed:", e)


read_url = f"{BASE_URL}/test.json{AUTH_PARAM}"

print("\nReading data from Firebase...")

try:
    with requests.get(read_url) as response:
        print("Read Status:", response.status_code)
        print("Data received:")
        print(response.text)
except Exception as e:
    print("Read failed:", e)

print("\nDone.")