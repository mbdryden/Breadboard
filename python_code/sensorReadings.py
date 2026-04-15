import board
import adafruit_sht4x

# Initialize I2C
i2c = board.I2C()
# Initialize the SHT45 sensor
sht = adafruit_sht4x.SHT4x(i2c)

print("Found SHT4x with serial number", hex(sht.serial_number))
sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION

#function values --> print out temp/humid vals
def values():
    tempC, humidity = sht.measurements
    tempF = (tempC *9 /5)+32
    return tempF, humidity 
