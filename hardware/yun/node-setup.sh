echo "Installing and configuring node software. Please wait..."

# update opkg
opkg update

# install dependencies
opkg install libstdcpp
opkg install unzip

# pull down repository
wget --no-check-certificate -O /mnt/sda1/master.zip https://github.com/OMNIcapstone/omni/archive/master.zip
unzip -o /mnt/sda1/master.zip -d /mnt/sda1/
rm -r /mnt/sda1/omni
mv /mnt/sda1/omni-master /mnt/sda1/omni
rm /mnt/sda1/master.zip

# install nodejs globally
opkg install node

# install node-serialport globally
opkg install node-serialport

# enable firmata bridge using precompiled-sketch
run-avrdude /mnt/sda1/omni/hardware/yun/sketches/StandardFirmataForATH0/StandardFirmataForATH0.hex

# place node firmata files in global node_modules directory
cp -r /mnt/sda1/omni/hardware/yun/node_modules/firmata /usr/lib/node_modules/firmata

# disable currently running bridge (if not already disabled)
if (! grep -q \#ttyATH0 /etc/inittab); then
	sed -i 's/ttyATH0/#ttyATH0/' /etc/inittab;
fi

# change hostname
read -p "What should the hostname be for this node? (no spaces): " hostname
uci set system.@system[0].hostname="$hostname"

# change password
read -p "What should the new password be for this node? (no spaces): " newPassword
echo -e "$newPassword\n$newPassword" | passwd root

# change wifi information
echo "The following is a list of available Wifi Access Points"
iw wlan0 scan | grep SSID

read -p "Enter the name of your Wifi Access Point (Router): " wifiSSID
read -p "Enter your Wifi password: " wifiPass

uci set wireless.@wifi-iface[0].ssid="$wifiSSID"
uci set wireless.@wifi-iface[0].key="$wifiPass"
uci set arduino.@wifi-iface[0].ssid="$wifiSSID"
uci set arduino.@wifi-iface[0].key="$wifiPass"

uci commit

# reboot
echo "Now rebooting. Please wait..."
reboot