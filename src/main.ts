import { parseArgs } from "jsr:@std/cli/parse-args";

import { fetchData, Post } from "./data_fetching.ts";

const ARGS = parseArgs(Deno.args, {
  boolean: ['help'],
  string: ['user', 'file'],
  number: ['max_requests'],
  alias: {
    'help': 'h',
  },
});

function exit(code: number) {
  Deno.exit(code);
}

function help(): void {
  console.log('Usage: curious_cat_backup: [OPTIONS...]');

  console.log('\nRequired flags:');
  console.log(' --user            The profile to query. Posts from this profile will be saved.');
  console.log(' --file            The file location data will be saved to. If no file exists at\n                   the specified location, a new file will be created. Must be a\n                   .csv file.');

  console.log('\nOptional flags:');
  console.log(' -h, --help        Display list of options and exit program.');
  exit(0);
}

async function processData(user: string, file: string, maxRequests = Infinity, maxTimestamp?: number) {
  if (maxRequests <= 0) {
    console.log('Max request limit reached');
    exit(0);
  }
  
  const data = await fetchData(user, maxTimestamp);

  if (!data.posts.length) {
    console.log('No more posts to process.');
    exit(0);
  }

  console.log(data.posts.map(p => p.post.comment));
  
  const nextTimeStamp = data.posts[data.posts.length - 1].post.timestamp - 1;
  await processData(user, file, maxRequests - 1, nextTimeStamp);
} 

async function main(): Promise<void> {
  if (ARGS.help) help();

  const user = ARGS.user || prompt('Username: ');
  const file = ARGS.file || prompt('File location: ');
  if (!user) {
    console.log('Please provide a valid username.');
    exit(1);
  }
  if (!file) {
    console.log('Please provide a valid file path.');
    exit(1);
  }


  await processData(user, file, ARGS.max_requests);
}

await main();
exit(0);