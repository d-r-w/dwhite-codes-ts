import { TagMap } from './Event';
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

  private constructor(publisher: npub, content: string, publishedAt: number|null = Math.floor(Date.now() / 1000), title: string = 'Untitled Post', summary?: string) {
    this.publisher = publisher;
    this.title = title;
    this.content = content;
    this.publishedAt = publishedAt ?? Math.floor(Date.now() / 1000);
    this.tags = [
      ['title', title]
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

    const tagMap = new TagMap(event.tags);

    const title = tagMap.get('title');
    const summary = tagMap.get('summary');

    return new LongformPost(publisher, event.content, event.created_at, title, summary);
  }

  public static fromNew(publisher: npub, title: string, summary: string, content: string): LongformPost {
    return new LongformPost(publisher, content, null, title, summary);
  }
}

export default LongformPost;