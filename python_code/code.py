import time
#from sensorReadings import values
import controls_logic as ctrl

#sample period 40 for final, using smaller for testing 
smpPeriod= 40
last_time= time.monotonic()

while True: 
    #For just testing temp/humidity readings
    '''
    temp,humidity=values()
    print("Temperature: %0.1f F" % temp)
    print("Humidity: %0.0f %%" % humidity)
    print("")
    time.sleep(40)
    '''
    #For testing controls logic portion 
    now = time.monotonic()
    dt = now - last_time
    last_time = now
    ctrl.control_step(dt)
 
    time.sleep(smpPeriod)
