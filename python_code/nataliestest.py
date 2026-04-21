import time
import board
import busio
import digitalio
import adafruit_sht4x

from adafruit_ra8875 import ra8875
from adafruit_ra8875.ra8875 import color565

# ----------------------------
# Colors
# ----------------------------
BLACK   = color565(0, 0, 0)
RED     = color565(255, 0, 0)
GREEN   = color565(0, 255, 0)
BLUE    = color565(0, 0, 255)
YELLOW  = color565(255, 255, 0)
CYAN    = color565(0, 255, 255)
MAGENTA = color565(255, 0, 255)
WHITE   = color565(255, 255, 255)

# ----------------------------
# Temperature settings
# ----------------------------
HEATER_ON_TEMP = 80.0
HEATER_OFF_TEMP = 80.0   # same threshold, exactly as requested

# ----------------------------
# Sensor setup
# ----------------------------
i2c = board.I2C()
sht = adafruit_sht4x.SHT4x(i2c)
sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION

print("Found SHT4x with serial number:", hex(sht.serial_number))

# ----------------------------
# Display pin setup
# CS  - D33
# RST - D15
# INT - D32
# ----------------------------
cs_pin = digitalio.DigitalInOut(board.D33)
rst_pin = digitalio.DigitalInOut(board.D15)
int_pin = digitalio.DigitalInOut(board.D32)   # not used yet

# ----------------------------
# Heater pins
# Heater 1 - D27
# Heater 2 - D12
# ----------------------------
heater1 = digitalio.DigitalInOut(board.D27)
heater1.direction = digitalio.Direction.OUTPUT
heater1.value = False

heater2 = digitalio.DigitalInOut(board.D12)
heater2.direction = digitalio.Direction.OUTPUT
heater2.value = False   # unused for now

# ----------------------------
# SPI / display setup
# ----------------------------
BAUDRATE = 6000000
spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI, MISO=board.MISO)

display = ra8875.RA8875(spi, cs=cs_pin, rst=rst_pin, baudrate=BAUDRATE)
display.init()
display.fill(BLACK)

# Header
display.txt_color(WHITE, BLACK)
display.txt_size(1)
display.txt_set_cursor(10, 20)
display.txt_write("TEMP / HUMIDITY / HEATER")

def read_sensor():
    temp_c, humidity = sht.measurements
    temp_f = (temp_c * 9 / 5) + 32
    return temp_f, humidity

def update_display(temp_f, humidity, heater_on):
    # Clear a larger area before writing new values
    display.fill_rect(0, 55, 480, 140, BLACK)

    # Temp line
    display.txt_color(YELLOW, BLACK)
    display.txt_size(2)
    display.txt_set_cursor(10, 65)
    display.txt_write("Temp: {:.1f} F".format(temp_f))

    # Humidity line
    display.txt_color(CYAN, BLACK)
    display.txt_size(2)
    display.txt_set_cursor(10, 105)
    display.txt_write("Humidity: {:.1f} %".format(humidity))

    # Heater line
    display.txt_size(2)
    display.txt_set_cursor(10, 145)
    if heater_on:
        display.txt_color(RED, BLACK)
        display.txt_write("Heater 1: ON ")
    else:
        display.txt_color(GREEN, BLACK)
        display.txt_write("Heater 1: OFF")

def control_heater(temp_f):
    # Turn heater on when below 80
    if temp_f < HEATER_ON_TEMP:
        heater1.value = True

    # Turn heater off when above 80
    elif temp_f > HEATER_OFF_TEMP:
        heater1.value = False

    # If exactly 80, leave it as-is
    return heater1.value

last_temp = None
last_humi = None
last_heater = None

while True:
    temp_f, humidity = read_sensor()
    heater_on = control_heater(temp_f)

    if (
        last_temp is None or
        abs(temp_f - last_temp) >= 0.1 or
        last_humi is None or
        abs(humidity - last_humi) >= 0.1 or
        heater_on != last_heater
    ):
        update_display(temp_f, humidity, heater_on)
        last_temp = temp_f
        last_humi = humidity
        last_heater = heater_on

    print(
        "Temp: {:.1f} F   Humidity: {:.1f} %   Heater1: {}".format(
            temp_f, humidity, "ON" if heater_on else "OFF"
        )
    )

    time.sleep(2)