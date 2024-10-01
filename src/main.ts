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

const POSTS: Post[] = [];

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
    return;
  }
  
  const data = await fetchData(user, maxTimestamp);

  if (!data.posts.length) {
    console.log('No more posts to process.');
    return;
  }

  data.posts.forEach(p => POSTS.push(p.post));
  
  const nextTimeStamp = data.posts[data.posts.length - 1].post.timestamp - 1;
  await processData(user, file, maxRequests - 1, nextTimeStamp);
}

function getDate(post: Post): Date {
  return new Date(post.timestamp * 1000);
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
  console.log(`Saved ${POSTS.length} posts from between ${getDate(POSTS[0])} and ${getDate(POSTS[POSTS.length - 1])}`);
}

await main();
exit(0);