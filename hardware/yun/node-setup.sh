# update opkg
opkg update

# install dependencies
opkg install libstdcpp
opkg install git

# install nodejs
opkg install node

# install node-serialport
opkg install node-serialport

# enable firmata using precompiled-sketch
run-avrdude /mnt/sda1/omni/hardware/yun/sketches/StandardFirmataForATH0/StandardFirmataForATH0.hex

# place node firmata files in node_modules directory
cp -r /mnt/sda1/omni/hardware/yun/node_modules/firmata /usr/lib/node_modules/firmata

# disable bridge (if not already disabled)
if (! grep -q \#ttyATH0 /etc/inittab); then
	sed -i 's/ttyATH0/#ttyATH0/' /etc/inittab;
fi