import { parseArgs } from "jsr:@std/cli/parse-args";

import { fetchData, getPostData, Post } from "./data_fetching.ts";
import { Entry, getLastId, toCSV, toEntries, writeToFile } from "./file_management.ts";

const ARGS = parseArgs(Deno.args, {
  boolean: ['help'],
  string: ['user', 'file'],
  number: ['max_requests'],
  alias: {
    'help': 'h',
  },
});

let POSTS: Entry[] = [];

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

  if (!data?.posts?.length) {
    console.log('No more posts to process.');
    return;
  }

  data.posts.forEach(p => POSTS.push({
    id: p.post.id,
    question: p.post.comment,
    answer: p.post.reply,
    likes: p.post.likes,
    date: getDate(p.post),
    response_to: p.post.in_response_to?.id,
  }));
  
  const nextTimeStamp = data.posts[data.posts.length - 1].post.timestamp - 1;
  await processData(user, file, maxRequests - 1, nextTimeStamp);
}

function getDate(post: Post): Date {
  return new Date(post.timestamp * 1000);
}

async function wait(time: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, time);
  })
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
  if (!file.endsWith('.csv')) {
    console.log('File path must end with .csv');
    exit(1);
  }

  const id = await getLastId(file);
  const lastPost = await getPostData(user, id);
  const nextTimeStamp = lastPost ? lastPost.post.timestamp - 1 : undefined;
  try {
    await processData(user, file, ARGS.max_requests, nextTimeStamp);
    await writeToFile(file, POSTS);
    console.log(`Saved ${POSTS.length} posts from between ${POSTS[POSTS.length - 1].date} and ${POSTS[0].date}`);
} catch (e) {
    await writeToFile(file, POSTS);
    const delay = 20_000 * (1.5 - Math.random());
    if (POSTS.length) console.log(`Saved ${POSTS.length} posts from between ${POSTS[POSTS.length - 1].date} and ${POSTS[0].date}`);
    console.log(`Encountered an error fetching posts, likely due to rate limiting. Retrying in ${delay / 1000} seconds.`);
    if (POSTS.length) console.log('Posts successfully saved. It is safe to stop and restart the program.')
    POSTS = [];
    await wait(delay);
    await main();
  }
}

await main();
exit(0);