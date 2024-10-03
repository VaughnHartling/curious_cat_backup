
export interface Data {
    posts: PostData[];
}

export interface PostData {
    type: 'post';
    post: Post;
} 

export interface Post {
        id: number;
        timestamp: number;
        likes: number;
        comment: string;
        reply?: string;
        addresseeData: {
            id: number;
            username: string
        };
        in_response_to?: Post; 
}

export async function fetchData(user: string, maxTimestamp?: number): Promise<Data|undefined> {
    const maxTimestampParam = maxTimestamp ? `&max_timestamp=${maxTimestamp}` : '';
    const url = `https://curiouscat.live/api/v2.1/profile?username=${user}${maxTimestampParam}`
    console.log(url)
    const res = await fetch(url);
    try {
        return await res.json();
    } catch(e) {
        console.log('Failed to load posts. Please try again.\nThis error may appear multiple times.');
        throw new Error(e);
    }
}

export async function getPostData(user: string, id: string | number): Promise<PostData|undefined> {
    console.log('id', id)
    const url = `https://curiouscat.live/api/v2.1/profile/single_post?username=${user}&post_id=${id}`;
    console.log(url);
    const res = await fetch(url);
    console.log(JSON.stringify(res.body))
    try {
        return await res.json();
    } catch(e) {
        console.log('Failed to load the timestamp of the oldest saved post. Please try again.\nThis error may appear multiple times.');
        throw new Error(e);
    }
}