echo "Setting up the MicroSD to be used as filesystem storage. Please wait..."

if [ ! -d /mnt/sda1 ]; then

	echo "MicroSD is not available. Please re-insert, or format as FAT32"

elif (! mount | grep ^/dev/sda | grep -q 'on /overlay'); then

	cd /

	# install tools
	opkg update
	opkg install e2fsprogs mkdosfs fdisk rsync

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# clear partition table
	dd if=/dev/zero of=/dev/sda bs=4096 count=10

	# create first partition
	(echo n; echo p; echo 1; echo; echo +700M; echo w) | fdisk /dev/sda

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# create second partition
	(echo n; echo p; echo 2; echo; echo; echo w) | fdisk /dev/sda

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# specify first partition FAT32
	(echo t; echo 1; echo c; echo w) | fdisk /dev/sda

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	sleep 5

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# format first partition FAT32
	mkfs.vfat /dev/sda1

	sleep 1

	# format second partition EXT4
	mkfs.ext4 /dev/sda2

	# create folder structures
	mkdir -p /mnt/sda1
	mount /dev/sda1 /mnt/sda1
	mkdir -p /mnt/sda1/arduino/www

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# copy files from flash to folder structure
	mkdir -p /mnt/sda2
	mount /dev/sda2 /mnt/sda2
	rsync -a --exclude=/mnt/ --exclude=/www/sd /overlay/ /mnt/sda2/

	# unmount SD
	umount /dev/sda?
	rm -rf /mnt/sda?

	# update fstab
	uci add fstab mount
	uci set fstab.@mount[0].target=/overlay
	uci set fstab.@mount[0].device=/dev/sda2
	uci set fstab.@mount[0].fstype=ext4
	uci set fstab.@mount[0].enabled=1
	uci set fstab.@mount[0].enabled_fsck=0
	uci set fstab.@mount[0].options=rw,sync,noatime,nodiratime
	uci commit

	# reboot
	echo "Now rebooting. Please wait..."
	reboot

else

	echo "MicroSD is already setup correctly. Nothing to do."

fi