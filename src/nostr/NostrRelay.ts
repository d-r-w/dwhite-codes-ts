import { Event, relayInit } from 'nostr-tools';

class NostrRelay {
  public readonly uri: string;
  public readonly websocketURI: string;
  public readonly contact: string;
  public readonly description: string;
  public readonly name: string;
  public readonly pubkey: string;
  public readonly software: string;
  public readonly supportedNips: number[];
  public readonly version: string;
  public readonly isLongformContentSupported: boolean;

  constructor(uri: string, contact: string, description: string, name: string, pubkey: string, software: string, supportedNips: number[], version: string) {
    this.uri = uri;
    this.websocketURI = `wss://${uri}`;
    this.contact = contact;
    this.description = description;
    this.name = name;
    this.pubkey = pubkey;
    this.software = software;
    this.supportedNips = supportedNips;
    this.version = version;

    // It seems like most (if not all) relays actually do support this NIP even though they don't claim to
    const LONGFORM_CONTENT_NIP = 23; 
    this.isLongformContentSupported = supportedNips.includes(LONGFORM_CONTENT_NIP);
  }

  static async fromURI(relayURI: string): Promise<NostrRelay> {
    const fetch_response = await fetch(`https://${relayURI}/`, {
      headers: {
        'accept': 'application/nostr+json',
        'accept-language': 'en-US,en;q=0.9',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      method: 'GET'
    });
    const fetch_json = await fetch_response.json();
    
    return new NostrRelay(
      relayURI,
      fetch_json.contact,
      fetch_json.description,
      fetch_json.name,
      fetch_json.pubkey,
      fetch_json.software,
      fetch_json.supported_nips,
      fetch_json.version
    );
  }

  public static PublishResults = class PublishResults {
    public readonly failures: Set<string> = new Set();
    public readonly successes: Set<string> = new Set();

    public toString(): string {
      const successCount = this.successes.size;
      const totalAttempts = successCount + this.failures.size;

      return `Published to ${successCount} of ${totalAttempts} relays (${((successCount/totalAttempts)*100).toFixed(2)}%)`;
    }
  };

  public static async publishToAll(relayWebsocketURIs: string[], signedEvent: Event, perRelaySubmissionTimeoutMS = 10000) {
    const publishResults = new this.PublishResults();

    for(const relayWebsocketURI of relayWebsocketURIs) {
      try {
        console.debug(`Publishing event to ${relayWebsocketURI}..`);
        await NostrRelay.publish(relayWebsocketURI, signedEvent, perRelaySubmissionTimeoutMS);
        console.debug(`Published event to ${relayWebsocketURI}.`);
        publishResults.successes.add(relayWebsocketURI);
      }
      catch(error) {
        console.debug(`Unable to publish to ${relayWebsocketURI}: ${error}`);
        publishResults.failures.add(relayWebsocketURI);
      }
    }

    return publishResults;
  }

  public static publish(websocketURI: string, signedEvent: Event, submissionTimeoutMS = 10000): Promise<void> {
    return new Promise<void>(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor 
      let isResolved = false;
      let isRejected = false;

      const ensureRejected = (error: unknown) => {
        const errorMessage = (() => {
          if(error instanceof Error) {
            return error.message;
          }

          return String(error);
        })();

        if(!isResolved && !isRejected) {
          isRejected = true;
          reject(new Error(errorMessage));
        }
      };

      setTimeout(() => {
        ensureRejected('Timed out');
      }, submissionTimeoutMS);

      try {
        const relay = relayInit(websocketURI);

        await relay.connect();

        await relay.publish(signedEvent);

        await relay.get({
          ids: [signedEvent.id]
        });

        isResolved = true;
        resolve();
      }
      catch(error) {
        ensureRejected(error);
      }
    });
  }
}

export default NostrRelay;