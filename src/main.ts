import { parseArgs } from "jsr:@std/cli/parse-args";

const ARGS = parseArgs(Deno.args, {
  boolean: ['help'],
  string: ['user', 'file'],
  alias: {
    'help': 'h',
  }
});

function help(): void {
  console.log('Usage: curious_cat_backup: [OPTIONS...]');

  console.log('\nRequired flags:');
  console.log(' --user            The profile to query. Posts from this profile will be saved.');
  console.log(' --file            The file location data will be saved to. If no file exists at\n                   the specified location, a new file will be created. Must be a\n                   .csv file.');

  console.log('\nOptional flags:');
  console.log(' -h, --help        Display list of options and exit program.');
  Deno.exit(0);
}

async function fetchData(user: string, maxTimestamp?: number): Promise<string> {
  const maxTimestampParam = maxTimestamp ? `&max_timestamp=${maxTimestamp}` : '';
  const url = `https://curiouscat.live/api/v2.1/profile?username=${user}${maxTimestampParam}`
  const res = await fetch(url);
  return await res.json();
}

async function main(): Promise<void> {
  if (ARGS.help) help();

  const user = ARGS.user || prompt('Username: ');
  const file = ARGS.file || prompt('File location: ');
  if (!user) {
    console.log('Please provide a valid username.');
    Deno.exit(1);
  }
  if (!file) {
    console.log('Please provide a valid file path.');
    Deno.exit(1);
  }

  const data = await fetchData(user)
  console.log(data);
}

await main();
Deno.exit(0);