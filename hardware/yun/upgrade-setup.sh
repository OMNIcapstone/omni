if (! mount | grep ^/dev/sda | grep -q 'on /overlay'); then

	# go to SD card
	cd /mnt/sda1

	# install unzip utility
	opkg update
	opkg install unzip

	# download latest openwrt image
	wget http://arduino.cc/download.php?f=/openwrtyun/1/YunSysupgradeImage_v1.5.3.zip -O YunSysupgradeImage_v1.5.3.zip

	# unzip image
	unzip YunSysupgradeImage_v1.5.3.zip
	rm YunSysupgradeImage_v1.5.3.zip
	
	# update system
	run-sysupgrade openwrt-ar71xx-generic-yun-16M-squashfs-sysupgrade.bin

else

	echo "Yun disk must not be expanded before performing a system upgrade"

fi