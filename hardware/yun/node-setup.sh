# update opkg
opkg update

# install dependencies
opkg install libstdcpp
opkg install git

# install nodejs globally
opkg install node

# install node-serialport globally
opkg install node-serialport

# pull down repository
git clone git://github.com/OMNICapstone/omni.git /mnt/sda1/omni

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