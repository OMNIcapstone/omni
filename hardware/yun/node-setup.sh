# ensure everything happens on the SD card
cd /mnt/sda1

# update opkg
opkg update

# install dependencies
opkg install libstdcpp
opkg install git

# install nodejs
opkg install node

# install node-serialport
opkg install node-serialport

# clone repo onto SD card
git clone git://github.com/OMNIcapstone/omni.git

# enable firmata using precompiled-sketch
run-avrdude omni/hardware/yun/sketches/StandardFirmataForATH0/StandardFirmataForATH0.hex

# place node firmata files in node_modules directory
cp -r omni/hardware/yun/node_modules/firmata /usr/lib/node_modules/firmata

# disable bridge
sed -i 's/ttyATH0/#ttyATH0/' /etc/inittab

