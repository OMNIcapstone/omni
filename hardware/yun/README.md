Arduino Yun Setup
=================

These instructions will allow you to configure an Arduino Yun for use with the OMNI system. If something goes wrong during setup, revisit the step that did not work and try again.


Prerequisites:
--------------

1. Connect Yun to LAN via LAN cable
2. Wait for Yun to start broadcasting arduino.local
3. Connect to Yun via SSH using root@arduino.local, password = arduino
4. Insert a MicroSD card into the MicroSD slot (at least 1GB in size)


Step 1: Upgrade your Yun Firmware
---------------------------------

In order for the Yun to work correctly, its firmware needs to be upgraded to a supported version. The version used by the OMNI system is currently v1.5.3.

Enter the following command:

ash -c "$(curl -fsSLk https://raw.githubusercontent.com/OMNIcapstone/omni/master/hardware/yun/upgrade-setup.sh)"

- Allow the upgrade to complete without interruption or the linux image may become corrupted
- Once the upgrade is complete, the Yun will reboot.
- After reboot, reconnect to the Yun via SSH.


Step 2: Enable MicroSD to be used as Filesystem Storage
-------------------------------------------------------

The Yun comes standard with 16MB of flash memory, which is not enough to install all the required software for the OMNI system. To fix this, we can enable the MicroSD card to be used as filesystem storage, greatly increasing the amount of free space we can work with.

Enter the following command:

ash -c "$(curl -fsSLk https://raw.githubusercontent.com/OMNIcapstone/omni/master/hardware/yun/microsd-setup.sh)"

- Allow the process to complete without interruption
- Once the filesystem is in place, the Yun will reboot.
- After reboot, reconnect to the Yun via SSH.


Step 3: Setup and Configure the Node Software
---------------------------------------------

This step will pull down a copy of the OMNI software, install all dependencies, and upload a pre-compiled version of the firmata sketch to the Yun.
In addition, this step will allow you to configure the Yun hostname, password, and wifi connection.

Enter the following command:

ash -c "$(curl -fsSLk https://raw.githubusercontent.com/OMNIcapstone/omni/master/hardware/yun/node-setup.sh)"

- Allow the process to complete without interruption
- Once configured, the Yun will reboot.
- After reboot, reconnect to the Yun via SSH using the new hostname and password you have chosen during step 3.