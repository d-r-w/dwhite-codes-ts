import { UnsignedEvent, Event, getEventHash, getSignature } from 'nostr-tools';

const getSignedEvent = (unsignedEvent: UnsignedEvent, secretKey: string): Event => {
  const eventId = getEventHash(unsignedEvent);
  const eventSig = getSignature(unsignedEvent, secretKey);

  const signedEvent: Event = {
    ...unsignedEvent,
    id: eventId,
    sig: eventSig
  };

  return signedEvent;
};

class TagMap extends Map<string, string> {
  constructor(tags: string[][]) {
    const m = new Map<string, string>();

    tags.forEach(tagKVPair => {
      const key = tagKVPair[0];
      const value = tagKVPair[1];

      m.set(key, value);
    });

    super(m);
  }
}

export { getSignedEvent, TagMap};