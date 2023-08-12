import LongformPost from './nostr/LongformPost';
import NostrClient from './nostr/NostrClient';
import npub from './nostr/npub';

export class PostFeed {

  private posts: LongformPost[] = [];

  private readonly fetchTimeCooldownMS = 60000 * 5; // No sense in checking for posts more often than is necessary
  private lastFetchTimestamp: number = 0;
  
  private readonly nostrClient;
  private readonly publisher;
  private constructor(nostrClient: NostrClient, publisher: npub) {
    this.nostrClient = nostrClient;
    this.publisher = publisher;
  }
  
  private shouldFetchPosts(): boolean {
    return Date.now() - this.lastFetchTimestamp > this.fetchTimeCooldownMS;
  }

  private async fetchPosts() {
    if(!this.shouldFetchPosts()) {
      return;
    }

    try {
      this.posts = (await this.nostrClient.getLongformPosts(this.publisher))
        .sort((post1, post2) => post2.publishedAt - post1.publishedAt);

      this.lastFetchTimestamp = Date.now();
    }
    catch(error) {
      // While this isn't ideal, not much can be done about it
      console.error('Error encountered while fetching posts:');
      console.error(error);
    }
  }

  private getJSONObject(post: LongformPost) {
    return {
      identifier: post.identifier,
      publishedAt: post.publishedAt,
      title: post.title,
      summary: post.summary,
      content: post.content
    };
  }

  public getPostFeedJSON() {
    this.fetchPosts();
    const postsJSON = this.posts.map(post => this.getJSONObject(post));
    
    return { posts: postsJSON };
  }

  public static async initialize(nostrClient: NostrClient, publisher: npub) {
    console.debug('Initializing post feed..');
    const postFeed = new PostFeed(nostrClient, publisher);
    await postFeed.fetchPosts();
    console.debug('Post feed initialized.');

    return postFeed;
  }
}