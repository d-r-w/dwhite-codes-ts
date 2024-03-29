const targetNpub = (() => {
  if(!process.env.NPUB) {
    throw new Error('process.env.NPUB expected');
  }

  return process.env.NPUB;
})();

const targetNsec = (() => {
  if(!process.env.NSEC) {
    throw new Error('process.env.NSEC expected');
  }

  return process.env.NSEC;
})();

import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import NostrClient from './nostr/NostrClient';
import npub from './nostr/npub';
import LongformPost from './nostr/LongformPost';
import { nip19 } from 'nostr-tools';
import { PostFeed } from './PostFeed';

(async () => {
  const app = express();

  const nostrClient = await NostrClient.initialize();

  const dwhiteCodesNpub = new npub(targetNpub);
  const dwhiteCodesSecretKey = nip19.decode(targetNsec).data as string;

  const postFeed = await PostFeed.initialize(nostrClient, dwhiteCodesNpub, 15);

  const submitPostExample = async () => {
    const newPost = LongformPost.fromNew(dwhiteCodesNpub, 'A real post', 'Yes, an actual post', 'This time, every bit of the post is real and is definitely not just a test');
    const results = await nostrClient.submitLongformPost(newPost, dwhiteCodesSecretKey);
    console.log('submit results', results);
  };

  const editPostExample = async () => {
    const existingPost = LongformPost.fromEdit('1691864233600', dwhiteCodesNpub, 'Still a real post', 'Real, but edited', 'Ideally (per spec), relays and clients will treat this as an edit and not a new post');
    const results = await nostrClient.submitLongformPost(existingPost, dwhiteCodesSecretKey);
    console.log('submit results', results);
  };

  // Upgrade from HTTP to HTTPS
  if(!process.env.DISABLE_HTTPS) {
    app.enable('trust proxy');
    app.use('/', (req, res, next) => req.secure ? next() : res.redirect(`https://${req.headers.host}${req.url}`));
  }

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // NIP-05
  app.get('/.well-known/nostr.json', (req, res) => {
    res.json({
      names: {
        dwhite: 'd90d948824c4cdbaa5f36dbd98068f3edef18c4665e26ad626ecac34105e3b02'
      }
    });
  });

  app.get('/posts.json', (req, res) => {
    res.json(postFeed.getPostFeedJSON());
  });

  app.use('/', express.static('static', { index: 'index.html' }));

  http.createServer(app).listen(8000);

  if(!process.env.DISABLE_HTTPS) {
    https.createServer({
      key: fs.readFileSync('/etc/letsencrypt/live/dwhite.codes/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/dwhite.codes/fullchain.pem'),
    },
    app).listen(8080);
  }
})();