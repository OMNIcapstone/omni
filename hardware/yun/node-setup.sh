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
[ -d /tmp/upload ] && rm -rf /tmp/upload
mkdir -p /tmp/upload
cp /mnt/sda1/omni/hardware/yun/sketches/StandardFirmataForATH0/StandardFirmataForATH0.hex /tmp/upload/
/usr/bin/merge-sketch-with-bootloader.lua /tmp/upload/StandardFirmataForATH0.hex
/usr/bin/kill-bridge
/usr/bin/run-avrdude /tmp/upload/StandardFirmataForATH0.hex
rm -r /tmp/upload

# place node firmata files in global node_modules directory
cp -r /mnt/sda1/omni/hardware/yun/node_modules/firmata /usr/lib/node_modules/firmata

# disable currently running bridge (if not already disabled)
if (! grep -q \#ttyATH0 /etc/inittab); then
	sed -i 's/ttyATH0/#ttyATH0/' /etc/inittab;
fi

# change hostname
read -p "What should the hostname be for this node? (no spaces, default = arduino): " hostname
hostname="${hostname:-arduino}"

uci set system.@system[0].hostname="$hostname"
uci commit system

# change password
read -p "What should the new password be for this node? (no spaces): " newPassword
echo -e "$newPassword\n$newPassword" | passwd root

# change wifi information
read -p "Do you want to connect to a Wifi Access Point? (y/n): " yn
yn="${yn:-n}"

if [ "$yn" == "y" ] || [ "$yn" == "Y" ]; then

    echo "The following is a list of available Wifi Access Points"
    iw wlan0 scan | grep SSID
    
    read -p "Wifi Access Point (Router) Name: " wifiSSID
    read -p "Security (None, WAP, WPA, WPA2, default = None): " wifiSec
    read -p "Enter your Wifi password: " wifiPass

    if [ "$wifiSec" == "None" ] || [ "$wifiSec" == "none" ]; then wifiSec="none" 
    elif [ "$wifiSec" == "WAP" ] || [ "$wifiSec" == "wap" ]; then wifiSec="wap" 
    elif [ "$wifiSec" == "WPA" ] || [ "$wifiSec" == "wpa" ]; then wifiSec="psk" 
    elif [ "$wifiSec" == "WPA2" ] || [ "$wifiSec" == "wpa2" ]; then wifiSec="psk2"
    fi
    
    if [ "$wifiSSID" == "" ]; then wifiSSID=""; fi
    if [ "$wifiSec" == "" ]; then wifiSec="none"; fi
    if [ "$wifiPass" == "" ]; then wifiPass=""; fi

    uci set wireless.@wifi-iface[0].ssid="$wifiSSID"
    uci set wireless.@wifi-iface[0].encryption="$wifiSec"
    uci set wireless.@wifi-iface[0].key="$wifiPass"
    uci set wireless.@wifi-iface[0].mode="sta"
    
    uci commit wireless

fi

# reboot
echo "Now rebooting. Please wait..."
reboot