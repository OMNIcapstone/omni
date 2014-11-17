# update opkg
opkg update

# install dependencies
opkg install libstdcpp
opkg install unzip

# install nodejs globally
opkg install node

# install node-serialport globally
opkg install node-serialport

# pull down repository
wget --no-check-certificate -O /mnt/sda1/master.zip https://github.com/OMNIcapstone/omni/archive/master.zip
unzip /mnt/sda1/master.zip -d /mnt/sda1/
mv /mnt/sda1/omni-master /mnt/sda1/omni
rm /mnt/sda1/master.zip

# enable firmata using precompiled-sketch
run-avrdude /mnt/sda1/omni/hardware/yun/sketches/StandardFirmataForATH0/StandardFirmataForATH0.hex

# place node firmata files in global node_modules directory
cp -r /mnt/sda1/omni/hardware/yun/node_modules/firmata /usr/lib/node_modules/firmata

# disable bridge (if not already disabled)
if (! grep -q \#ttyATH0 /etc/inittab); then
	sed -i 's/ttyATH0/#ttyATH0/' /etc/inittab;
fi

# reboot
echo "Now rebooting. Please wait..."
reboot