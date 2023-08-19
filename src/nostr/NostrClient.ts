import NostrRelay from './NostrRelay';
import TargetRelayURIs from './TargetRelayURIs';
import 'websocket-polyfill';
import { SimplePool as SimpleRelayPool, nip19, Kind } from 'nostr-tools';
import npub from './npub';
import { Tags, getSignedEvent } from './Event';
import LongformPost from './LongformPost';

class NostrClient {

  private relays: NostrRelay[] = [];

  private relayWebsocketURIs: string[] = [];

  private readonly targetRelayPool: SimpleRelayPool = new SimpleRelayPool();

  private constructor() {
    console.debug('Nostr client created. Target relays:', TargetRelayURIs);
  }

  public async submitLongformPost(post: LongformPost, secretKey: string) {
    const signedEvent = getSignedEvent(post.unsignedEvent, secretKey);
    const publishResults = await NostrRelay.publishToAll(this.relayWebsocketURIs, signedEvent);
    console.log(publishResults.toString());
  }

  public async getLongformPosts(publisher: npub, limit: number): Promise<LongformPost[]> {
    try {
      const public_key_hex = nip19.decode(publisher.toString()).data.toString();
      let longform_events = await this.targetRelayPool.list(this.relayWebsocketURIs, [{authors: [public_key_hex], kinds: [Kind.Article], limit}]);

      // Spec: "Clients MAY choose to fully hide any events that are referenced by valid deletion events"
      // Because this applies to more than just Article events, this check may need to exist at a wider scope (for now it works)
      const deletion_events = await this.targetRelayPool.list(this.relayWebsocketURIs, [{authors: [public_key_hex], kinds: [Kind.EventDeletion]}]);
      longform_events = longform_events.filter(longform_event => {
        return !deletion_events.some(deletion_event => new Tags(deletion_event.tags).getAllTagValues('e').has(longform_event.id));
      });

      const longform_posts = longform_events.map(event => LongformPost.fromEvent(event));
      
      return LongformPost.getLatestVersionsOnly(longform_posts);
    }
    catch(error) {
      console.error(error);
      throw new Error('Error while getting posts');
    }
  }

  public async initialize() {
    const relays = await this.fetchRelays();

    console.debug('Relays fetched:', relays);

    this.relayWebsocketURIs = relays.map(relay => relay.websocketURI);    
  }

  private async fetchRelays(): Promise<NostrRelay[]> {
    const relays: NostrRelay[] = [];
    for(const relayURI of TargetRelayURIs) {
      try {
        const relay = await NostrRelay.fromURI(relayURI);
        console.debug('Fetched relay', relay.uri);
        relays.push(relay);
      }
      catch(error) {
        console.debug('Unable to fetch relay from', relayURI);
      }
    }
    return relays;
  }

  public static async initialize() {
    const client = new NostrClient();
    await client.initialize(); 
    return client;
  }
}

export default NostrClient;