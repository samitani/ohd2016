import RPi.GPIO as GPIO
import time
import sys
import urllib2
import fcntl

THRESHOLD_SECOND      = 2
WATCH_INTERVAL_SECOND = 0.2
LOCK_FILE = '/tmp/gpio.lock'
pin = [2, 10, 6]

if (len(sys.argv) != 3):
    print "USAGE: gpoi.py PinNO SERVER-IP"
    exit(1)

wear_id = sys.argv[1]
server_ip = sys.argv[2]

fh = file(LOCK_FILE, 'a+')
fcntl.flock(fh.fileno(), fcntl.LOCK_EX|fcntl.LOCK_NB)

pre_value = [-1, -1, -1]
value     = [-1, -1, -1]
counter   = [ 0,  0,  0]

GPIO.setmode(GPIO.BCM)
GPIO.setup(pin[0], GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(pin[1], GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(pin[2], GPIO.IN, pull_up_down=GPIO.PUD_UP)

try:
    while True:
        for i in [0, 1, 2]:
            value[i] = GPIO.input(pin[i])

            if (pre_value[i] == value[i]):
                counter[i] = counter[i] + 1
            else:
                counter[i] = 0

            print "DEBUG %s %s" % (pin[i], value[i])

            if (counter[i] == THRESHOLD_SECOND / WATCH_INTERVAL_SECOND):
                if (value[i] == 0):
                    print 'GPIO PIN %s is \033[32mON \033[0m' % pin[i]
                else:
                    print 'GPIO PIN %s is \033[31mOFF\033[0m' % pin[i]

                v = [0, 0, 0]
                v[0] = 1 if value[0] == 0 else 0
                v[1] = 1 if value[1] == 0 else 0
                v[2] = 1 if value[2] == 0 else 0

                try:
                    response = urllib2.urlopen('http://' + server_ip + '/api/button?wear_id=%s&button_1=%s&button_2=%s&button_3=%s' % (wear_id, v[0], v[1], v[2]), None, 3)
                except:
                    print('HTTP Error')

            pre_value[i] = value[i]

        time.sleep(WATCH_INTERVAL_SECOND)
except KeyboardInterrupt:
    GPIO.cleanup()

GPIO.cleanup()
