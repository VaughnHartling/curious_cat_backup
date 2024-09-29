
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

export async function fetchData(user: string, maxTimestamp?: number): Promise<Data> {
    const maxTimestampParam = maxTimestamp ? `&max_timestamp=${maxTimestamp}` : '';
    const url = `https://curiouscat.live/api/v2.1/profile?username=${user}${maxTimestampParam}`
    const res = await fetch(url);
    return await res.json();
}