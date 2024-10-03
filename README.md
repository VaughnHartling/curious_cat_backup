# Curious Cat Backup

## Instruction

### Step 1

Install this repo onto your machine

### Step 2

CD into the directory

### Step 3

Run the following command:

```shell
./cc_backup
```

Enter the `user` whose posts you would like to save and the destination `file` where you would like to save the posts.

NOTE: If a file does not exist at the path provided, a new file will be generated and formatted automatically.

These inputs can also be entered as flags:

```shell
./cc_backup --user=<username> --file=<file_destination>
```

#### Alternative

Download Deno and run the following command:

```shell
deno run ./src/main.ts --user=<username> --file=<file_destination>
```

### Step 4

The program will prompt you to provide permission to fetch data (and if you ran the program using Deno, to write to and read from your destination file.) To provide these permission, type `y` and press `enter`.

The program will begin querying the Curious Cat API. This API appears to be rate limited. You may notice the program pause temporarily when this rate limit is reached.
The program will save any new posts it found and pick up from the last post after a delay.
It is safe to stop the program at any time. Starting again will begin from the oldest post that has been saved.
