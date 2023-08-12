import { nip19 } from 'nostr-tools';

class npub {
  
  private readonly npub: string;

  constructor(npub: string) {
    this.npub = npub;
  }

  toString(): string {
    return this.npub;
  }

  static fromPublicKey(public_key_hex: string): npub {
    return new npub(nip19.npubEncode(public_key_hex));
  }
}

export default npub;