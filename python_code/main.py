import board
import adafruit_sht4x
import board
import pwmio
import time
import busio
import digitalio
from adafruit_ra8875 import ra8875
from adafruit_ra8875.ra8875 import color565
import os
import wifi
import adafruit_requests
import adafruit_connection_manager
import json
import time
from adafruit_datetime import datetime, timezone

BLACK = color565(0, 0, 0)
RED = color565(255, 0, 0)
BLUE = color565(0, 255, 0)
GREEN = color565(0, 0, 255)
YELLOW = color565(255, 255, 0)
CYAN = color565(0, 255, 255)
MAGENTA = color565(255, 0, 255)
WHITE = color565(255, 255, 255)

# Configuration for CS and RST pins:
cs_pin = digitalio.DigitalInOut(board.D33)
rst_pin = digitalio.DigitalInOut(board.D15)
int_pin = digitalio.DigitalInOut(board.D32)

# Config for display baudrate (default max is 6mhz):
BAUDRATE = 2000000

# Setup SPI bus using hardware SPI:
spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI, MISO=board.MISO)

display = ra8875.RA8875(spi, cs=cs_pin, rst=rst_pin, baudrate=BAUDRATE)
display.init()
display.fill(BLACK)

# Header
display.txt_color(WHITE, BLACK)
display.txt_size(1)
display.txt_set_cursor(10, 20)
display.txt_write("TEMP / HUMIDITY / HEATER")

DEFAULT_LOW= 70
DEFAULT_HIGH= 100
low_temp=DEFAULT_LOW
high_temp=DEFAULT_HIGH
setpoint = (low_temp + high_temp) / 2
#user temp variable
tempSet= False

KP= 0.2
KI= 0.0002
KD= 0.02

PWM_PIN_1= board.D27
PWM_PIN_2=board.D12

PWM_FREQ= 1000
PWM_CAP=0.80
DUTY_MIN=0
DUTY_MAX=1
SAFETY_MARGIN= 4

pwm1 = pwmio.PWMOut(PWM_PIN_1, frequency=PWM_FREQ, duty_cycle=0)
pwm2 = pwmio.PWMOut(PWM_PIN_2,frequency=PWM_FREQ,duty_cycle=0)

I = 0
prev_error = 0
duty = 0

cycleStart = False

print("Control subsystem init")
print("Range:", low_temp, "-", high_temp)
print("Setpoint:", setpoint,"\n")
# Initialize I2C
i2c = board.I2C()
# Initialize the SHT45 sensor
sht = adafruit_sht4x.SHT4x(i2c)
print("Found SHT4x with serial number", hex(sht.serial_number))
sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION
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
write_url = f"{BASE_URL}/logs.json{AUTH_PARAM}"
read_url = f"{BASE_URL}/boxes/1.json{AUTH_PARAM}"

def values():
    tempC, humidity = sht.measurements
    tempF = (tempC *9 /5)+32
    return tempF, humidity 

def compute_pid(error, dt):
    global I, prev_error
    #to prevent the divide by zero when inital starting times
    if dt <= 0:
        dt = 0.001
    #proprtional, integral, and derivative measurements
    P= KP * error
    I += KI * error * dt
    D= KD * (error - prev_error) / dt
    prev_error= error
    output= P + I + D
    if output < DUTY_MIN:
        output = DUTY_MIN
    if output > DUTY_MAX:
        output = DUTY_MAX
    return output

def control_step(dt):
    global duty
    tempF, humidity = values()
    #pass values to communication and feedback subsystems - HERE
    # Safety cutoff
    if tempF > (high_temp + SAFETY_MARGIN):
        duty= 0
        print("Safety cutoff triggered")
    else:
        error = setpoint - tempF
        duty = compute_pid(error, dt)
    
    #Cap duty to 80
    if duty > PWM_CAP:
        duty=PWM_CAP    
    
    pwm1.duty_cycle = int(duty * 65535)
    pwm2.duty_cycle = int(duty * 65535)
    #for screenshot --> time stamp and mode added
    current_time= time.monotonic()-start_time
    mode= "USER" if tempSet else "DEFAULT"
    print(f"[{current_time:6.2f}s] [{mode}] "
      f"T={tempF:.1f}F RH={humidity:.1f}% "
      f"Range[{low_temp},{high_temp}] "
      f"Duty={duty*100:.1f}%")
    #print(f"T={tempF:.1f}F  RH={humidity:.1f}%  "f"Range[{low_temp},{high_temp}]  "f"Duty={duty*100:.1f}%")

def update_display(temp_f, humidity, heater_on):

    # --- TEMP ---
    display.fill_rect(10, 65, 300, 40, BLACK)
    display.txt_color(YELLOW, BLACK)
    display.txt_size(2)
    display.txt_set_cursor(10, 65)
    display.txt_write("Temp: {:.1f} F".format(temp_f))

    # --- HUMIDITY ---
    display.fill_rect(10, 110, 300, 40, BLACK)
    display.txt_color(CYAN, BLACK)
    display.txt_size(2)
    display.txt_set_cursor(10, 110)
    display.txt_write("Humidity: {:.1f} %".format(humidity))

    # --- HEATER ---
    display.txt_size(2)
    display.txt_set_cursor(10, 180)

    if heater_on:
        display.txt_size(2)
        display.txt_color(RED, BLACK)
        display.txt_write("Heater: ON")
    else:
        display.txt_size(2)
        display.txt_color(GREEN, BLACK)
        display.txt_write("Heater: OFF")
    
last_temp = None
last_humi = None
last_heater = None
last_time = time.monotonic()
start_time=time.monotonic()
while True:
    try:
        with requests.get(read_url) as response:
            print("Read Status:", response.status_code)
            print("Data received:")
            txt = json.loads(response.text)
            cycleStart = txt.get('cycleInProgress')
            #check user temp --> Jordan
            tempSet= txt.get("tempSet",False)
            if tempSet:
                ideal_temp=txt.get("idealTemp")
                if ideal_temp is not None:
                    ideal_temp=float(ideal_temp)
                    setpoint =ideal_temp
                    low_temp=ideal_temp -5
                    high_temp=ideal_temp +5
                    print("User temp from firebase:",ideal_temp)
            else:
                print("Default temp range")
            #just for checking -- can delete later
            print("Temp set:", tempSet)
            print("Range:", low_temp,"-",high_temp)
            print("Setpoint:", setpoint)
    except Exception as e:
        print("Read failed:", e)

    try:
        last_control_time = time.monotonic()
        last_display_time = time.monotonic()
        last_log_time = time.monotonic()

        while cycleStart:
            #For testing controls logic portion 
            now = time.monotonic()
            if now - last_control_time >= 1.0:
                dt = now - last_time
                last_time = now
                control_step(dt)
                temp, humi = values()
                heater_on = duty > 0.01

            if now - last_display_time >= 1.0:
                last_display_time = now

                update_display(temp, humi, heater_on)

            if now - last_log_time >= 30.0:
                last_log_time = now
                #send to database logs
                data_to_send = {
                "logTime": "{:04d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
                time.localtime()[0], time.localtime()[1], time.localtime()[2], time.localtime()[3], time.localtime()[4], time.localtime()[5]),
                "boxID": 1,
                "temp": temp,
                "humdi": humi
                }
                print("\nSending data to Firebase...")

                try:
                    with requests.post(write_url, data=json.dumps(data_to_send)) as response:
                        print("Write Status:", response.status_code)
                        print("Write Response:", response.text)
                except Exception as e:
                    print("Write failed:", e)
                    
                try:
                    with requests.get(read_url) as response:
                        print("Read Status:", response.status_code)
                        print("Data received:")
                        txt = json.loads(response.text)
                        cycleStart = txt.get('cycleInProgress')
                except Exception as e:
                    print("Read failed:", e)
             
            time.sleep(0.05)
    finally:
        #set both heaters to 0
        pwm1.duty_cycle=0
        pwm2.duty_cycle=0
    
