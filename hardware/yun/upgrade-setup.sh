echo "Upgrading the Yun system. Please wait..."

if [ ! -d /mnt/sda1 ]; then

	echo "MicroSD is not available. Please re-insert, or format as FAT32"

else

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
    
fi