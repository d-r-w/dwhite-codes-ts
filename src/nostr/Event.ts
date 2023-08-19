import { UnsignedEvent, Event, getEventHash, getSignature } from 'nostr-tools';

export const getSignedEvent = (unsignedEvent: UnsignedEvent, secretKey: string): Event => {
  const eventId = getEventHash(unsignedEvent);
  const eventSig = getSignature(unsignedEvent, secretKey);

  const signedEvent: Event = {
    ...unsignedEvent,
    id: eventId,
    sig: eventSig
  };

  return signedEvent;
};

export class Tags {

  private readonly tagMap = new Map<string, Set<string>>();

  constructor(tags: string[][]) {
    tags.forEach(tagKVPair => {
      const key = tagKVPair[0];
      const value = tagKVPair[1]; // TODO Not sure how many (if any) tags use idx[2]+

      const targetSet = this.tagMap.get(key) ?? new Set();

      targetSet.add(value);
      this.tagMap.set(key, targetSet);
    });
  }

  public getAllTagValues(key: string): Set<string> {
    return this.tagMap.get(key) ?? new Set<string>;
  }

  public getSingleTagValue(key: string): string {
    return Array.from(this.getAllTagValues(key))[0];
  }
} 