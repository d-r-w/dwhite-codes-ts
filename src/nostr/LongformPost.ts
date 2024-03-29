import { Tags } from './Event';
import npub from './npub';
import { UnsignedEvent, Kind, nip19, Event } from 'nostr-tools';

class LongformPost {
  
  public readonly publisher: npub;
  public readonly title: string;
  public readonly content: string;
  public readonly publishedAt: number;
  public readonly tags: string[][];
  public readonly unsignedEvent: UnsignedEvent;
  public readonly summary: string|undefined;
  public readonly identifier: string;

  private constructor(publisher: npub, content: string, publishedAt: number|null = Math.floor(Date.now() / 1000), title: string = 'Untitled Post', summary?: string, postID?: string|null) {
    this.publisher = publisher;
    this.title = title;
    this.content = content;
    this.publishedAt = publishedAt ?? Math.floor(Date.now() / 1000);
    this.identifier = postID ?? String(Date.now());
    this.tags = [
      ['title', title],
      ['d', this.identifier],
      ['published_at', String(this.publishedAt)]
    ];
    if(summary) {
      this.tags.push(['summary', summary]);
    }
    this.summary = summary;

    this.unsignedEvent = {
      kind: Kind.Article,
      pubkey: nip19.decode(this.publisher.toString()).data.toString(),
      created_at: this.publishedAt,
      content: this.content,
      tags: this.tags
    };
  }

  public static fromEvent(event: Event): LongformPost {
    const publisher = new npub(nip19.npubEncode(event.pubkey));

    const tags = new Tags(event.tags);

    const title = tags.getSingleTagValue('title');
    const summary = tags.getSingleTagValue('summary');

    return new LongformPost(publisher, event.content, event.created_at, title, summary);
  }

  public static fromNew(publisher: npub, title: string, summary: string, content: string): LongformPost {
    return new LongformPost(publisher, content, null, title, summary);
  }

  public static fromEdit(postID: string, publisher: npub, title: string, summary: string, content: string) {
    return new LongformPost(publisher, content, null, title, summary, postID);
  }

  public static getLatestVersionsOnly(posts: LongformPost[]) {
    const uniquePosts = new Map<string, LongformPost>();

    posts.forEach(post => {
      const existingVersion = uniquePosts.get(post.identifier);
      if((existingVersion?.publishedAt ?? 0) < post.publishedAt) {
        uniquePosts.set(post.identifier, post);
      }
    });

    return Array.from(uniquePosts.values());
  }
}

export default LongformPost;