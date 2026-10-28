# CYBER 454 — Exam 2 study guide

Exam: Thursday, October 29, 2026, 1:35 PM, Olmsted E-236.

Original explanations based on the supplied Chapter 5–9 slide decks. Practice questions are generated study aids, not actual exam questions.

Chapter weights: 5 = 20%; 6 = 20%; 7 = 28%; 8 = 8%; 9 = 24%. The slide lists 25 total questions but the chapter rows sum to 24.


## Chapter 5: Recovering data


### Deletion is not erasure

Think of a file system as a library catalog. Deleting an entry can remove the directions to a book without destroying its pages. A normal deletion generally makes storage reusable; recoverable bytes may remain until overwritten or otherwise erased. Stop unnecessary writes, acquire an image, verify its hash, and recover to a different destination. Recovery is a possibility, not a promise. SSD TRIM and garbage collection can reduce recovery opportunities.

Source: course Chapter 5, PDF pages 3–10.

Recall: Why may a normally deleted file still be recoverable?

Answer: Its bytes may remain until its storage is reused.


### Sectors, clusters, and slack

A sector is a storage unit at the device level. A cluster is a file-system allocation unit made of one or more sectors. A small file may occupy only part of its final cluster: the unused tail is file slack. Unallocated space consists of clusters not assigned to active files. An HDD uses magnetic platters and heads; an SSD uses flash chips and a controller. Both can hold evidence, but their deletion behavior differs.

Source: course Chapter 5, PDF pages 4–5.

Recall: Unused bytes after a file ends inside its allocated cluster are called what?

Answer: File slack


### FAT chains

FAT16/FAT32 use a file allocation table to track a chain of clusters. Each chain entry points toward the next cluster; EOC marks the end. Other values identify free, reserved, or bad clusters. Deleting a file releases its chain for reuse. If the chain information is lost, fragmentation can make recovery harder even when some content remains. FAT is not limited to old Windows installations; the slides use older Windows to introduce it.

Source: course Chapter 5, PDF pages 6–8.

Recall: What does EOC identify in a FAT chain?

Answer: The end of the cluster chain


### NTFS: MFT and bitmap

The Master File Table (MFT) stores records describing files and directories, including names, timestamps, attributes, and data-location information. The volume cluster bitmap tracks allocation. Moving an item to the Recycle Bin is different from permanently deleting it. Technical correction: NTFS deletion clears the record’s in-use state; the slide’s special-character description should not be treated as the general NTFS mechanism. The important exam concept is that deletion need not immediately erase content.

Source: course Chapter 5, PDF pages 9–10.

Recall: Which NTFS structure describes individual files and their metadata?

Answer: Master File Table (MFT)


### Windows recovery tools

Recognize the tool-to-task matches from the slides: DiskDigger scans for recoverable files; WinUndelete offers a wizard for choosing a drive, file types, and restore destination; FreeUndelete is another recovery utility; OSForensics includes deleted-file searching; Autopsy provides forensic analysis and recovery from images. Product editions, pricing, and exact screens change, so study their roles. Recover onto another disk or working destination to avoid overwriting the evidence you need.

Source: course Chapter 5, PDF pages 11–25.

Recall: Which pair includes full forensic tools with deleted-file recovery?

Answer: OSForensics and Autopsy


### Linux inodes and links

An inode holds file metadata and references to data; directory entries associate names with inode numbers. Hard links are additional names for the same underlying file. Removing one name decrements the link count. Storage becomes reclaimable after the last hard link is removed and no process still holds the file open. A symbolic or soft link points to a path and does not preserve the target in the same way. The slides simplify deletion to the reference count reaching zero.

Source: course Chapter 5, PDF pages 26–27.

Recall: A file has two hard links. One is removed. What normally happens?

Answer: The remaining hard link still accesses the file.


### Linux recovery with grep and extundelete

The slides propose reducing writes with legacy single-user mode (init 1), then searching raw data. In grep -i -a -B10 -A100 "forensics" image.dd, -i ignores case, -a treats input as text, and -B/-A include lines before/after the match. This extracts matching content, not necessarily a complete original file. extundelete targets ext3/ext4 recovery; the lecture example is extundelete /dev/sda4 --restore-all. Actual recovery depends on filesystem features and remaining metadata. Use copies for practice.

Source: course Chapter 5, PDF pages 28–29.

Recall: Which utility in Chapter 5 targets ext3/ext4 undelete?

Answer: extundelete


### Scalpel and file carving

File carving recognizes content patterns such as headers and footers rather than relying on a healthy directory entry. Scalpel workflow: install; enable the desired file formats in /etc/scalpel/scalpel.conf; choose an empty output directory; run scalpel against the image with -o for output. Carving is useful when metadata is damaged, but may lose filenames, timestamps, or fragmented pieces. It cannot reconstruct bytes that have actually been overwritten merely by recognizing a header.

Source: course Chapter 5, PDF pages 30–32, 44.

Recall: Which recovery method searches file signatures rather than intact directory metadata?

Answer: File carving


### Signature memory sheet

Memorize the abbreviated prefixes shown in class: JPEG FF D8; BMP 42 4D; EXE 4D 5A; GIF 47 49; MP3 with ID3 49 44; PDF 25 50; ZIP 50 4B; PNG 89 50; WAV and AVI 52 49. These are short clues, not complete unique validators. WAV and AVI both use RIFF and need later type bytes to distinguish them. Not every MP3 starts with an ID3 tag. A filename extension can be renamed; content signatures give another clue.

Source: course Chapter 5, PDF pages 45–46.

Recall: The class prefix 4D 5A most strongly suggests which file type?

Answer: Windows EXE


### Physical versus logical damage

Physical damage involves hardware such as a drive controller, read/write head, or platter. Logical damage affects structures such as file-system metadata, even if the hardware still reads. The slides show connecting a drive to a test system, attempting access, imaging, and repair options. For evidence handling, preserve and image before making repairs when feasible; head or platter replacement belongs in a qualified recovery lab. Power failures during writes can leave logical structures inconsistent.

Source: course Chapter 5, PDF pages 36–39.

Recall: A healthy drive has corrupted directory structures after a power outage. What kind of damage is this?

Answer: Logical damage


### Consistency checking

Windows chkdsk, Linux fsck, and macOS Disk Utility are associated with file-system checking or repair. The Sleuth Kit and TestDisk also appear in the recovery discussion. A consistency checker compares structures against the filesystem rules; for example, . should refer to the directory itself and .. to its parent. Repairs may discard inconsistent entries, so a repair can change or destroy evidence. Journaling and battery-backed power reduce corruption risk but do not replace backups.

Source: course Chapter 5, PDF pages 39–42.

Recall: Why should a forensic examiner avoid immediately repairing the original evidence disk?

Answer: Repair may change or discard evidence.


### Zero-knowledge analysis

Here, zero-knowledge analysis means recovery with few assumptions about the damaged file system, not a cryptographic zero-knowledge proof. The tool scans and uses knowledge of valid filesystem structures to reconstruct organization. It is slower than ordinary consistency checking but can help when existing metadata is severely destroyed. Compare: consistency checking trusts enough structure to check it; reconstruction starts with less trust; carving focuses on individual file content.

Source: course Chapter 5, PDF pages 43.

Recall: Which approach makes few assumptions about surviving filesystem structures?

Answer: Zero-knowledge analysis


### macOS recovery overview

The slides connect macOS recovery to its UNIX heritage and HFS+/APFS storage. They name MacKeeper as a historical recovery example. Do not make a recovery guarantee from a product name: filesystem type, encryption, snapshots, overwriting, and SSD behavior matter. First check Trash and available copies, then consider image-based recovery. A surviving backup can restore content that ordinary undelete cannot.

Source: course Chapter 5, PDF pages 33–35.

Recall: What most directly limits recovery of the original deleted bytes?

Answer: Those bytes have been overwritten or erased.


## Chapter 6: Windows forensics


### Windows versions and boot context

The slides survey Windows 3.x, 95/NT, 98/2000, XP/Server 2003, Vista/7/Server 2008, 10/Server 2016, Server 2019, 11, Server 2022 and 2025. Establish the examined OS version because paths, artifacts, and boot systems differ. Ask whether the firewall and EFS are enabled. The lecture boot model is legacy: BIOS → POST → MBR/boot loader → NTLDR and boot.ini → kernel, HAL, Registry, subsystem. Modern Windows uses Boot Manager and winload with BIOS or UEFI; do not apply NTLDR to every version.

Source: course Chapter 6, PDF pages 3–11.

Recall: Which boot sequence vocabulary belongs to the legacy model in the slides?

Answer: NTLDR and boot.ini


### Important Windows processes

Know the roles: ntoskrnl.exe is the Windows kernel; hal.dll provides the hardware abstraction layer; smss.exe manages sessions; winlogon.exe supports interactive logon; lsass.exe handles local security; explorer.exe provides the desktop/file shell; csrss.exe is the client/server runtime subsystem. The slide spells the last item Crss.exe. Legacy ntdetect.com detects hardware; ntbootdd.sys relates to certain older boot configurations. fsutil can report filesystem information. A familiar process name alone does not prove a process is legitimate.

Source: course Chapter 6, PDF pages 9–11.

Recall: Which listed file is the Windows kernel?

Answer: ntoskrnl.exe


### Collect volatile evidence early

Volatile evidence includes RAM contents, running processes, active connections, and logged-on users. Power loss can remove it. The chapter workflow is collect a memory dump → compute its hash → analyze in an isolated environment. Document the collection because live acquisition itself changes some state. A hash helps verify that the collected image has not changed; it does not prove that every interpretation of it is correct.

Source: course Chapter 6, PDF pages 12–13.

Recall: What is the chapter’s memory-analysis sequence?

Answer: Capture memory, hash the capture, analyze in isolation


### Stack versus heap

The stack organizes function-call state with last-in, first-out behavior: the newest call is unwound first. The heap provides dynamically allocated storage that can remain across function calls until released. Both may contain useful values or strings. Neither is a separate permanent archive. Memory evidence must be interpreted in process context rather than assuming every string was intentionally saved.

Source: course Chapter 6, PDF pages 13.

Recall: Which memory organization is associated with last-in, first-out behavior?

Answer: Stack


### Match live-response tools

PsList lists process information. PsInfo reports system/OS information. ListDLLs reports loaded DLLs. PsLoggedOn reports logon information. netstat reports network connections and listening endpoints. Example: investigate a suspicious network connection by combining netstat results with process information instead of treating the IP address alone as proof of malware.

Source: course Chapter 6, PDF pages 14–19.

Recall: Which tool is the direct match for loaded dynamic-link libraries?

Answer: ListDLLs


### Paging versus hibernation

pagefile.sys is disk-backed paging space that supports virtual memory and can retain memory fragments. hiberfil.sys stores hibernation-related memory state and can contain application artifacts. Depending on format and tool support, an examiner may convert and analyze a hibernation file or search strings. Neither is identical to a fresh live RAM capture. The files are commonly at the system drive root, not necessarily inside the Windows folder.

Source: course Chapter 6, PDF pages 20–21.

Recall: Which file is associated with hibernation rather than ordinary paging?

Answer: hiberfil.sys


### Volume Shadow Copy

Volume Shadow Copy Service (VSS) supports point-in-time volume snapshots. Older versions of changed data can help reconstruct or recover prior file states. The slide describes daily changed-block copying; snapshot frequency actually depends on configuration and the requester. A snapshot is different from RAM, a pagefile, or a deleted-file list. Investigate whether snapshots exist instead of assuming they are always available.

Source: course Chapter 6, PDF pages 22.

Recall: Where might an examiner find a previous state of a file?

Answer: A volume shadow copy


### Windows event logs

Event Viewer displays logs. Security relates to audited security events; Application to application events; System to OS/components; ForwardedEvents to collected remote events; Applications and Services to more specific providers. For a timeline, correlate relevant entries with user, process, and file evidence. Logging configuration and retention affect what exists. Absence of a log entry is not automatically absence of activity.

Source: course Chapter 6, PDF pages 23–24.

Recall: Which Windows interface is used to inspect event logs?

Answer: Event Viewer


### User folders and program folders

C:\Users contains profiles for multiple users; C:\Users\username\Documents holds one user’s documents. C:\Program Files normally holds applications, and on 64-bit Windows C:\Program Files (x86) conventionally holds 32-bit applications. Older Windows used Documents and Settings. Examine all relevant profiles, not just the currently logged-on user. The slide’s combined Windows documents and settings path is not a universal directory.

Source: course Chapter 6, PDF pages 25.

Recall: On 64-bit Windows, which directory conventionally holds 32-bit applications?

Answer: C:\Program Files (x86)


### Unallocated space, slack, and ADS

Unallocated space is available for new allocation; slack is unused space within an allocated file’s last cluster. Both may hold remnants. NTFS alternate data streams (ADS) are additional named streams associated with a file and may store data separate from its default stream. ADS are not the same as deleted data. FTK indexing makes keyword searching across an image more efficient; a keyword match still needs context and validation.

Source: course Chapter 6, PDF pages 26.

Recall: An extra named stream attached to an NTFS file is what?

Answer: An alternate data stream


### Legacy browser artifact: index.dat

index.dat belongs to legacy Internet Explorer activity, not Microsoft Edge. The slides associate it with browsing addresses, searches, and recently accessed items and name Window Washer as a viewing example. Identify the browser and version before selecting artifact locations. Finding a historical URL is evidence of recorded activity, not by itself proof that a particular person intentionally viewed the page.

Source: course Chapter 6, PDF pages 27–28.

Recall: Which browser family is associated with the chapter’s index.dat discussion?

Answer: Legacy Internet Explorer


### Copy/move permissions and MAC times

The lecture rule for the same NTFS volume: a normal copy inherits destination permissions; a normal move retains existing permissions. MAC in this context means Modified, Accessed, Created—not a network MAC address. Created refers to creation on that volume; Modified to content change; Accessed to access activity. Tools, OS settings, copying, and timestamp manipulation can complicate a timeline. Do not interpret a timestamp without context.

Source: course Chapter 6, PDF pages 29–30.

Recall: Under the chapter’s same-volume rule, a normally moved file does what?

Answer: Retains its existing permissions


### Registry root keys

The Registry stores configuration for the system, users, hardware, and programs. HKLM = machine-wide settings; HKCU = current user; HKU = loaded users; HKCR = classes/file associations; HKCC = current hardware configuration. The slides abbreviate HKEY_CURRENT_CONFIG as HCU; HKCC is the usual abbreviation. Registry evidence can point to USB use, wireless connections, application settings, recent activity, and removed software.

Source: course Chapter 6, PDF pages 31–35.

Recall: Which Registry root is most directly associated with machine-wide configuration?

Answer: HKEY_LOCAL_MACHINE


### Control sets

The slides present ControlSet001 as the booted set and ControlSet002 as last known good, CurrentControlSet as a reference to the active set, and Clone as a boot-time copy. Treat the numbering as a lecture example, not a fixed mapping on every Windows installation. The key exam idea is that CurrentControlSet selects active control configuration; different stored sets can support startup and recovery.

Source: course Chapter 6, PDF pages 33–34.

Recall: What is CurrentControlSet conceptually?

Answer: A reference to the active control set


### Application activity artifacts

Use several artifacts together. UserAssist can record GUI-launched application activity. Prefetch can support application execution analysis and may include run information. Shimcache/AppCompatCache holds compatibility-related program metadata; its presence alone is not universal proof of execution. Amcache stores program/file inventory metadata. ShellBags preserve folder-view information and can help identify folders browsed. SRUM concerns resource usage. BAM/DAM relate to background/desktop activity management. Availability and meanings vary by Windows version.

Source: course Chapter 6, PDF pages 36–43.

Recall: Which artifact is especially associated with folder browsing/view settings?

Answer: ShellBags


### A Windows investigation in plain language

Suppose a user denies running a program and copying files. Preserve live memory and connections if appropriate; image the disk; inspect all relevant user profiles; correlate application artifacts, USB-related Registry data, file timestamps, and event logs. A single artifact can be ambiguous. A stronger conclusion connects multiple independent records with compatible timestamps and documented acquisition. Separate observed facts from inferred actions.

Source: course Chapter 6, PDF pages 12–43.

Recall: Why correlate several Windows artifacts?

Answer: One artifact may be incomplete or ambiguous.


## Chapter 7: Linux forensics


### Linux foundations, shells, and desktops

Linux is a kernel used in distributions such as Ubuntu, Debian, Fedora, Mint, RHEL, openSUSE, and CentOS. The lecture timeline connects UNIX, GNU, Minix, and Linux (1991). A shell interprets commands: Bash, sh, ksh, and csh are examples. A graphical desktop is a different layer: GNOME, KDE Plasma, CDE, Enlightenment, Cinnamon, and LXDE. Cinnamon is associated with Mint; LXDE emphasizes low resource use. Do not confuse a distribution, a shell, and a desktop.

Source: course Chapter 7, PDF pages 3–4, 11–14, 18.

Recall: Which item is a shell rather than a distribution or desktop?

Answer: Bash


### Navigation and directory listing

ls lists entries; ls -l gives a long listing; ls -a includes hidden dot-names. cd changes directory: cd .. moves to the parent, cd / to the filesystem root, and cd ~ to your home. mkdir creates a directory; mkdir -p also creates missing parents. Correction: ls -ls means long listing plus allocated-size information; use ls -lS to sort by size. Case matters in command flags.

Source: course Chapter 7, PDF pages 5–6.

Recall: Which command includes hidden dot-files in a directory listing?

Answer: ls -a


### Copying, moving, and deleting

cp copies; cp -R recursively copies directory contents. mv moves or renames. rm removes file names; rm -i prompts; rm -r operates recursively. rmdir removes empty directories, not arbitrary populated directories. These change data, so recognize them on an exam but practice on disposable files or copies. A command’s name does not make it a forensic acquisition tool.

Source: course Chapter 7, PDF pages 5–7.

Recall: Which command removes an empty directory?

Answer: rmdir


### Processes: ps, pstree, top, pgrep

ps provides a process snapshot; ps aux is a common broad listing. pstree shows parent-child relationships. top refreshes process/resource information interactively. pgrep locates process IDs by matching criteria. The slides simplify some ps flags; options differ between styles, so ps -a alone is not literally every process. If a shell unexpectedly launches an executable, the process tree helps connect them.

Source: course Chapter 7, PDF pages 8–9, 35–37.

Recall: Which tool most directly shows which process launched another process?

Answer: pstree


### Open files, attributes, partitions, mounts

lsof lists open files and the processes using them. lsattr lists filesystem attributes where supported. fdisk -l lists partition information; note the space before -l. mount attaches a filesystem at a mount point; the chapter example mounts a floppy at /mnt/floppy. fsck checks filesystem consistency and may modify structures depending on invocation. A mounted drive is not automatically read-only.

Source: course Chapter 7, PDF pages 9–10.

Recall: Which tool links open files to processes?

Answer: lsof


### Legacy boot sequence

Study the class sequence: BIOS/POST → MBR → GRUB or LILO → kernel initialization → init → runlevel. The kernel manages hardware and core OS functions; the boot loader loads the kernel. /etc/inittab is part of the legacy init configuration. Modern distributions commonly use UEFI and systemd, so this is a course model rather than a universal boot recipe.

Source: course Chapter 7, PDF pages 15–16, 27.

Recall: In the lecture Linux boot sequence, what loads before the kernel?

Answer: GRUB or LILO


### Runlevels: memorize 0, 1, 3, 5, 6

The slide’s traditional mapping is 0 halt, 1 single-user, 2 user-definable, 3 multiuser without GUI, 4 user-definable, 5 multiuser with GUI, 6 reboot. Its service directories follow /etc/rc.d/rcN.d. Memory cue: 0 stops, 1 is alone, 3 is text, 5 adds graphics, 6 restarts. These mappings vary by distribution; answer course-specific questions using the table.

Source: course Chapter 7, PDF pages 16.

Recall: According to the slide table, which runlevel is multiuser without a GUI?

Answer: 3


### LVM and snapshots

Logical Volume Management adds an abstraction between physical storage and logical volumes. The chapter emphasizes resizing storage and taking snapshots for backups. A snapshot captures a point-in-time view; it is not inherently an independent off-device backup. Forensics requires knowing which logical volumes and underlying physical devices hold the relevant data.

Source: course Chapter 7, PDF pages 17.

Recall: Which pair describes the chapter’s main LVM benefits?

Answer: Resizing volumes and taking snapshots


### ext3/ext4 journaling modes

Journaling records pending changes to help recover consistency after a crash. In journal mode, file data and metadata are journaled; ordered mode journals metadata and orders data writes before related metadata commit; writeback mode journals metadata without that same ordering guarantee. The slide ranks journal as safest for this purpose and writeback as least safe. It lists ext4 limits of 1 EB volumes and 16 TB files; actual limits depend on features and configuration.

Source: course Chapter 7, PDF pages 19.

Recall: Which mode journals both file data and metadata?

Answer: Journal mode


### Other file systems

The slides describe ReiserFS as journaled and efficient with many small files. Berkeley Fast File System is associated with UFS and a bitmap for free-space tracking. Technical context: FFS/UFS comes from BSD/UNIX history, not originally from Linux. The central comparison is how a filesystem organizes data, tracks free storage, and supports recovery after interrupted writes.

Source: course Chapter 7, PDF pages 20.

Recall: Which filesystem does the lecture associate with many small files?

Answer: ReiserFS


### Linux log locations

Learn the lecture matches: kern.log → kernel messages; lpr.log → printing; mail.* → email; mysql.* → database; apache2/* and lighttpd/* → web servers; apport.log → crashes; IDS logs → suspicious traffic. The slide lists fail.log for failed logins; actual systems may use auth.log, secure, btmp, faillog, or the system journal. Confirm the distribution and logging configuration rather than expecting every example path.

Source: course Chapter 7, PDF pages 21–22.

Recall: Which lecture log best matches kernel messages?

Answer: /var/log/kern.log


### Reading and investigating logs

less and more page through text. tail -f follows new lines as a file grows. grep searches matching content. dmesg displays the kernel ring buffer; dmesg | lpr sends that output to the print system. ls -al gives sizes that can reveal zero-byte logs, but a listing alone does not prove deliberate deletion. An unexplained gap, truncation, or binary content deserves comparison with rotated logs and other sources.

Source: course Chapter 7, PDF pages 22, 35–36.

Recall: Which command follows new log lines live?

Answer: tail -f logfile


### Root, home, binaries, and configuration

/ is the filesystem root. /root is the root administrator’s home; /home commonly holds ordinary users’ homes. /bin contains essential command binaries; /sbin holds system-administration binaries. /etc stores system configuration. /usr holds shareable software and related data, not the normal collection of personal home directories. The slide’s /usr description needs that correction. Evidence in /etc may reveal altered services or startup configuration.

Source: course Chapter 7, PDF pages 24–26, 30.

Recall: Where would you usually look for system configuration files?

Answer: /etc


### Devices, boot files, and mount points

/dev contains device nodes, such as disk interfaces. /boot contains boot-related files, often kernel images and boot-loader data. /mnt is a conventional temporary mount location; other mount locations exist, so it is not a complete inventory of mounted devices. The slides use older hd/fd naming examples; actual devices can appear as /dev/sda or /dev/nvme0n1 and partitions under those names.

Source: course Chapter 7, PDF pages 28–29.

Recall: Which directory contains device nodes?

Answer: /dev


### Temporary files, backups, and spools

/tmp holds temporary files and can be cleared at boot or by policy. /var/tmp is intended for temporary files surviving reboots; the slide’s 30-day cleanup is an example policy, not a universal guarantee. /var/backups may hold copies of system files. /var/spool contains queued work such as printing or mail. Collect transient data promptly and document actual retention settings.

Source: course Chapter 7, PDF pages 30–31.

Recall: Which directory is intended for temporary data that survives reboots?

Answer: /var/tmp


### proc, run, and tmpfs

/proc exposes kernel/process state through a virtual filesystem. /run holds runtime state, commonly on volatile storage. tmpfs is memory-backed and its filesystem contents disappear when unmounted; collect relevant data before shutdown. Correction: Linux tmpfs can use swap, so “never written to disk” is too absolute. The lecture Volatility command is a version-specific analysis example, not a universal memory-capture command.

Source: course Chapter 7, PDF pages 32–34.

Recall: Why prioritize collecting relevant tmpfs content?

Answer: Its filesystem contents disappear on unmount or shutdown.


### Identify files and search suspicious content

file examines content to identify type; an extension can lie. ELF is the common Linux executable format. The lecture combines find with file and grep ELF to locate executables, including in /tmp. find / -mtime -1 finds files modified within roughly the last 24 hours; it does not specifically mean newly created. find / -type d -name ".*" locates dot-prefixed directories. -nouser/-nogroup can identify orphaned ownership references.

Source: course Chapter 7, PDF pages 35, 38–40.

Recall: What does find / -mtime -1 primarily filter on?

Answer: Modification time within the last day


### Scheduled tasks and user context

Check scheduled work for unexplained persistence. The run-together slide line should be read as three commands: crontab -l lists the current user’s cron jobs; atq lists queued at jobs; systemctl list-timers --all lists systemd timers. history can show shell command history, but may be incomplete. who shows logged-on users; su switches user context; kill sends a signal to a process. These are distinct tasks.

Source: course Chapter 7, PDF pages 35, 39–40.

Recall: Which command lists systemd timers?

Answer: systemctl list-timers --all


### Linux recovery and forensic workflow

The lecture’s manual recovery reduces activity using single-user mode, searches raw storage with grep, and examines recovered text. Prefer working from an acquired image with verified hashes. Kali includes tools useful for an independent second examination. The slides show legacy web-based Autopsy, a GUI for The Sleuth Kit: create a case, add a host, add an image, verify its hash, then analyze. A mounted image and a booted VM are different; a running guest may write, so preserve the original and use a working copy/overlay.

Source: course Chapter 7, PDF pages 41–49.

Recall: Why verify the forensic image’s hash?

Answer: To detect changes to the acquired image


### Document the system and recognize advanced tools

cat /etc/os-release identifies OS information; cat /etc/hostname reports the stored hostname; cat /etc/timezone may report timezone where that file exists. The slide also names older Sleuth Kit dcat, dls, dcalc, dstat and mmls: recognize data-unit inspection, listing, address translation, statistics, and volume-layout work. locate searches a filename database, which may be stale; xargs builds command arguments from input. Keep timezone context when joining evidence from different machines.

Source: course Chapter 7, PDF pages 50.

Recall: Which command reads the distribution identification file?

Answer: cat /etc/os-release


## Chapter 8: macOS forensics


### Mac foundations and file systems

The chapter surveys Apple history, OS X releases, and macOS through Tahoe. Core filesystem progression: MFS → HFS → HFS+ → APFS. HFS+ adds Unicode, long names, journaling, quotas, links, and aliases. APFS arrived with the High Sierra era and is distinct from HFS+. The slides list support for other filesystem formats such as ISO9660, MS-DOS/FAT, NTFS, UDF, and UFS; support and write capability depend on OS and drivers. Partition schemes include MBR, GPT, and Apple Partition Map.

Source: course Chapter 8, PDF pages 3–11.

Recall: Which is Apple’s newer filesystem contrasted with HFS+?

Answer: APFS


### HFS+ structures

For the HFS+ model in class, sectors 0 and 1 are boot blocks and sector 2 contains the volume header. The allocation file tracks which allocation blocks are in use/free. HFS+ uses 32-bit allocation block addressing, names up to 255 characters, Unicode, hard/soft links, aliases, quotas, and journaling. An alias is a reference to an item, not another independent copy of its contents.

Source: course Chapter 8, PDF pages 7–9.

Recall: In the chapter’s HFS+ layout, what is in sector 2?

Answer: The volume header


### Boot Camp and acquisition

Boot Camp can place Windows alongside macOS on supported Intel Macs; an examination may need both OS environments. The slides name MacQuisition for imaging and MacDrive/APFS for Windows for reading Apple filesystems from a Windows workstation. Target Disk Mode exposes a supported Mac’s storage to another Mac. Correction: it is not inherently a write blocker. Use a validated acquisition method and protect the source. Preserve a master image and analyze a copy; simply starting a VM does not guarantee immutability.

Source: course Chapter 8, PDF pages 12, 20–22, 26, 29–32.

Recall: Why does Boot Camp matter to an examiner?

Answer: Relevant evidence may also exist in the installed Windows environment.


### Mac logs and useful paths

Map evidence to locations: /Users → user accounts/files; /Applications → installed apps; /Volumes → mounted volumes; /etc → configuration; /private/var/audit → audit records; /var/spool/cups → print spool information; /var/vm → swap/sleep-related evidence depending on version. User Library/Preferences can retain app settings, including traces after removal. Shell history depends on the shell, such as .bash_history or .zsh_history. Some slide paths contain typos or old examples; validate paths on the actual image.

Source: course Chapter 8, PDF pages 13–19, 23.

Recall: Where should you look for mounted-volume entries on macOS?

Answer: /Volumes


### TCC and knowledgeC

TCC means Transparency, Consent, and Control. Its database records privacy permission decisions for applications; the slides show system and user TCC.db locations under Library/Application Support/com.apple.TCC. knowledgeC.db is associated with the Knowledge framework and can record activity context; the chapter points to ~/Library/Application Support/Knowledge/. Availability varies by version. These artifacts help answer what apps were allowed to access and what activity context was recorded, not automatically who physically used the device.

Source: course Chapter 8, PDF pages 27–28.

Recall: Which database records application privacy-permission decisions?

Answer: TCC.db


### Mac shell commands

date reports date/time context. ls /dev/disk? lists matching device names. system_profiler SPHardwareDataType reports hardware information; system_profiler SPSoftwareDataType reports software/system information. The slide line breaks split those DataType names; type each as one argument. The deck’s hdiutil partition example should be treated as a version-specific slide example; diskutil list is a common way to inspect disk/partition layout. Shell familiarity transfers from Linux, but paths and options can differ.

Source: course Chapter 8, PDF pages 24–25.

Recall: Which command requests Mac hardware information?

Answer: system_profiler SPHardwareDataType


### Trash and undelete limits

Start with the user’s Trash, commonly ~/.Trash; external volumes can have their own trash storage. Moving a file back out of Trash differs from recovering a file after permanent deletion. The slides name Disk Drill, Mac Undelete, and Free Undelete as recovery examples. Truly overwritten bytes are not recovered by ordinary undelete; seek surviving copies, snapshots, or fragments elsewhere. APFS, encryption, and SSD TRIM complicate recovery.

Source: course Chapter 8, PDF pages 33–37.

Recall: If a file is still in Trash, what is the simplest recovery concept?

Answer: Restore the existing item from Trash


### Password recovery: understand the distinctions

The slides cover authorized recovery: older Intel Command-R recovery, resetpassword, firmware-password restrictions, SIP, account plist extraction, and hash analysis. Password reset changes an account credential; password cracking tests candidates against a hash. They are not the same as decrypting FileVault-protected data, and a reset may not unlock an old keychain. The lecture csrutil disable step changes protection and system state; it is not a neutral evidence-collection step. Modern recovery behavior varies by hardware and macOS version.

Source: course Chapter 8, PDF pages 38–44.

Recall: Why is resetting a login password not the same as recovering all encrypted data?

Answer: Encrypted data may require separate original keys or credentials.


## Chapter 9: Email forensics


### The journey of an email

A client submits a message; servers relay it toward the destination; the destination server stores it; the recipient accesses it. Evidence may exist in client databases, server logs, mailboxes, attachments, and backups. Review sender/recipient addresses, copied recipients, timestamps with offsets, message content, attachments, IPs, and application logs. Preserve the original message and full headers; a screenshot alone leaves out useful structure.

Source: course Chapter 9, PDF pages 3–4.

Recall: Which evidence should accompany a suspicious message’s visible body?

Answer: Full original headers and relevant message data


### SMTP and its ports

SMTP sends mail from clients to servers and between servers. Memorize the lecture’s 25 for SMTP and 465 for implicit TLS SMTP. Additional context: authenticated submission commonly uses 587 with STARTTLS. Port numbers suggest service roles; they do not by themselves prove a connection was encrypted or legitimate. SMTP is transport, not the protocol used to synchronize inbox folders.

Source: course Chapter 9, PDF pages 5.

Recall: Which protocol relays mail between servers?

Answer: SMTP


### POP3 versus IMAP

POP3 retrieves messages, commonly downloading them; the class model deletes them from the server after download, but clients can be configured to leave copies. IMAP manages mail on the server and synchronizes mailbox state/folders across devices. POP3 ports: 110 and TLS 995. IMAP ports: 143 and TLS 993. Memory cue: SMTP sends; POP pulls; IMAP manages a server mailbox.

Source: course Chapter 9, PDF pages 5.

Recall: Which secure port is associated with IMAP in the slides?

Answer: 993


### Spoofing and anonymous remailing

Spoofing makes a message appear to come from another sender; a friendly display name or From address is not identity proof. An anonymizing remailer forwards mail after removing or replacing identifying information. Its logs, if available and lawfully obtained, may help trace the prior hop. A malicious email can come from a real compromised account, so even authentic transport does not make a link safe. A visible IP may identify a relay or VPN rather than the sender’s own device.

Source: course Chapter 9, PDF pages 6–8.

Recall: What distinguishes an anonymous remailer?

Answer: It forwards mail while replacing or stripping identifying information.


### Header standards and required fields

The course names RFC 2822 for message format: Date and From are required in an ordinary message; Message-ID and In-Reply-To are recommended/conditional context, not the same required pair. RFC 3864 is associated with header-field registration. RFC 3798 describes Message Disposition Notifications (MDNs). These are historical references in the slides; RFC 5322 later superseded RFC 2822. An MDN is a disposition report, not infallible proof that a human read and understood a message.

Source: course Chapter 9, PDF pages 9–14.

Recall: Which pair does the course identify as required header fields?

Answer: From and Date


### Know the header fields

From identifies the claimed author; Sender can identify a different transmitting agent; Reply-To directs replies; To names primary recipients; Cc names copied recipients; Bcc is generally concealed from other recipients. Subject summarizes the message; Content-Type describes MIME media type/structure; Message-ID identifies a message; In-Reply-To and References connect threads. Do not assume Bcc recipients are all visible in a received copy. A changed Reply-To can be an investigative clue.

Source: course Chapter 9, PDF pages 11–13.

Recall: Which field can direct replies somewhere other than the From address?

Answer: Reply-To


### Received lines and trust

Each handling mail server can prepend a Received line, so the newest hop is usually at the top. Read bottom-to-top to reconstruct the apparent chronological route, but verify from known trusted receiving infrastructure toward the origin: attacker-supplied lower lines can be fabricated. Compare IPs, names, timestamps, offsets, and server logs. Header tracing narrows a path; it does not automatically establish a person’s identity or precise physical address.

Source: course Chapter 9, PDF pages 10, 13, 32.

Recall: Which Received line is usually added most recently?

Answer: The topmost Received line


### SPF: permitted sending hosts

SPF uses a domain’s DNS policy to check whether a connecting mail server is permitted to send for an SMTP envelope identity. It is not a general list of friendly From display names. It authenticates a sending host/domain relationship, not the text’s truth or the human author. Forwarding can complicate SPF checks. Investigators should preserve the receiver’s Authentication-Results and evaluate who produced them.

Source: course Chapter 9, PDF pages 15–16.

Recall: What does SPF primarily test?

Answer: Whether the sending host is authorized for the checked envelope domain


### DKIM: signed message data

DKIM lets a signing domain attach a cryptographic signature over selected headers and body content. A receiver uses the domain’s published key to verify the signature. A valid signature supports integrity of the signed material and association with the signing domain; it does not prove a particular person wrote the email or that its content is safe. SPF and DKIM answer different questions.

Source: course Chapter 9, PDF pages 16.

Recall: What does successful DKIM verification support?

Answer: Integrity of signed content and association with the signing domain


### DMARC: alignment and policy

DMARC connects the visible From domain to an aligned passing SPF or DKIM result and supplies domain policy/reporting. A message does not need both mechanisms to pass if one qualifying aligned mechanism passes. Do not confuse authentication with safety: a criminal can authenticate mail for a domain they control, and a compromised legitimate account can send harmful mail. The course’s DNS/SPF/DKIM description is the starting point; alignment is the key distinction.

Source: course Chapter 9, PDF pages 16.

Recall: Which result can satisfy DMARC authentication alignment?

Answer: A passing aligned SPF or DKIM result


### Find the full headers

Recognize the interfaces shown in the course: classic Outlook → open message → File → Properties → Internet headers; Yahoo → View raw message; Gmail → Show original; the slide’s Hotmail example → View Message Source; Apple Mail → View → Message → Long Headers. These are course/version-specific labels, not a promise every current app looks identical. Export the original when possible and retain attachments in their original relationship to the message.

Source: course Chapter 9, PDF pages 17–25.

Recall: Which Gmail option is shown in the lecture for original headers?

Answer: Show original


### Mail storage formats

PST is an Outlook data store; OST is an offline/synchronized Outlook store. Outlook Express historically used MBX/DBX, and Eudora used MBX. A common individual-message format is EML; the slide appears to say .emi, which should not be memorized as the usual extension. Database containers and single-message files are different. Keep an original copy before opening a store in a client that might modify it.

Source: course Chapter 9, PDF pages 26–27.

Recall: Which extension is associated with an offline Outlook store?

Answer: OST


### Paraben and case organization

The lecture presents Paraben’s Email Examiner as an email-focused forensic application. Its workflow groups evidence by case, associates investigator information, then selects the email database to analyze. FTK and EnCase are broader suites also mentioned for comparison. The important concept is organized, documented examination of original/working evidence, not merely opening a message and reading the body.

Source: course Chapter 9, PDF pages 28–31.

Recall: What does the lecture’s Paraben workflow organize evidence around?

Answer: A case and investigator record


### Server evidence and retention

Deletion from a client or both correspondents does not guarantee every server-side copy is gone. Search relevant retained mail, deleted-item retention, logs, backups, or archives within the authorized scope. Retention policies determine what may remain and for how long. Correlate server records with client artifacts and headers. Do not promise recovery: a policy or backup can expire before the investigation.

Source: course Chapter 9, PDF pages 32–33.

Recall: Why examine the email server after a user deletes a message?

Answer: Retained copies or logs may still exist.


### Law recognition: privacy and commercial mail

For exam recognition: the Fourth Amendment concerns government searches and seizures. ECPA is a framework governing interception and access to electronic communications, including stored communications provisions. CAN-SPAM regulates commercial email practices such as deceptive routing/subjects and opt-out requirements. These names are not blanket permission to inspect anyone’s mailbox. Actual authority depends on the facts, legal process, and scope; this guide provides course-level definitions.

Source: course Chapter 9, PDF pages 34.

Recall: Which named law primarily concerns commercial email practices?

Answer: CAN-SPAM Act


### Law recognition: other names in the deck

CALEA concerns lawful-interception assistance capabilities of covered communications providers. FISA supplies a framework for certain foreign-intelligence surveillance. The USA PATRIOT Act amended multiple investigative and surveillance authorities; do not assume every original provision is still operative. 18 U.S.C. 2252B addresses misleading Internet domain names used to deceive people into viewing obscenity, with additional provisions involving minors and harmful material. It is not a general anti-spam law.

Source: course Chapter 9, PDF pages 34.

Recall: Which listed law concerns communications-provider assistance for lawful interception?

Answer: CALEA