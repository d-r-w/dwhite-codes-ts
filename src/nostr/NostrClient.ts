import NostrRelay from './NostrRelay';
import TargetRelayURIs from './TargetRelayURIs';
import 'websocket-polyfill';
import { SimplePool as SimpleRelayPool, nip19, Kind } from 'nostr-tools';
import npub from './npub';
import { getSignedEvent } from './Event';
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

  public async getLongformPosts(publisher: npub): Promise<LongformPost[]> {
    try {
      const public_key_hex = nip19.decode(publisher.toString()).data.toString();
      const events = await this.targetRelayPool.list(this.relayWebsocketURIs, [{authors: [public_key_hex], kinds: [Kind.Article], limit: 15}]);
      const posts = events.map(event => LongformPost.fromEvent(event));
      
      return LongformPost.getLatestVersionsOnly(posts);
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