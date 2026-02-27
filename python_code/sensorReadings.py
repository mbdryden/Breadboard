import time
import board
import adafruit_sht4x

# Initialize I2C
i2c = board.I2C()

# Initialize the SHT45 sensor
sht = adafruit_sht4x.SHT4x(i2c)

print("Found SHT4x with serial number", hex(sht.serial_number))
sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION

#print out temp/humid vals
while True:
  temperature, humidity = sht.measurements
  print("Temperature: %0.1f C" % temperature)
  print("Humidity: %0.1f %%" % humidity)
  print("")
  time.sleep(1)
