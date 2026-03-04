import time

import board
import busio
import digitalio

from adafruit_ra8875 import ra8875
from adafruit_ra8875.ra8875 import color565

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
BAUDRATE = 6000000

# Setup SPI bus using hardware SPI:
spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI, MISO=board.MISO)

display = ra8875.RA8875(spi, cs=cs_pin, rst=rst_pin, baudrate=BAUDRATE)
display.init()

display.fill(BLACK)
    
display.txt_color(WHITE, BLACK)
display.txt_size(1)
display.txt_set_cursor(10, 40)
display.txt_write("TEMPERATURE        HUMIDITY")


def update_display(t, h):
    display.txt_color(YELLOW, BLACK)
    display.txt_size(3)
    display.txt_set_cursor(15, 120) # Offset by 40 for number width
    display.txt_write(str(round(t, 1)) + "°    " + str(round(h, 1)) + "%")
    
last_temp = None
temp = 124.5 #taken from sensor
humi = 60 # taken from sensor
while True:
    if temp != last_temp:
        update_display(temp, humi)
        last_temp = temp
        temp += 0.2
    print("hi")
    time.sleep(5)