import board
import pwmio
import sensorReadings as sensor

#Global vals
DEFAULT_LOW= 70
DEFAULT_HIGH= 100

USER_RANGE= None
KP= 0.2
KI= 0.0002
KD= 0.02

PWM_PIN= board.D6
PWM_FREQ= 1000

DUTY_MIN=0
DUTY_MAX=1
SAFETY_MARGIN= 4

pwm = pwmio.PWMOut(PWM_PIN, frequency=PWM_FREQ, duty_cycle=0)

I = 0
prev_error = 0
duty = 0

if USER_RANGE is None:
    low_temp = DEFAULT_LOW
    high_temp = DEFAULT_HIGH
else:
    low_temp, high_temp = USER_RANGE

setpoint = (low_temp + high_temp) / 2

print("Control subsystem init")
print("Range:", low_temp, "-", high_temp)
print("Setpoint:", setpoint,"\n")


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
    tempF, humidity = sensor.values()
    #pass values to communication and feedback subsystems - HERE

    # Safety cutoff
    if tempF > (high_temp + SAFETY_MARGIN):
        duty= 0
        print("Safety cutoff triggered")

    else:
        error = setpoint - tempF
        duty = compute_pid(error, dt)

    pwm.duty_cycle = int(duty * 65535)

    print(f"T={tempF:.1f}F  RH={humidity:.1f}%  "f"Range[{low_temp},{high_temp}]  "f"Duty={duty*100:.1f}%")

