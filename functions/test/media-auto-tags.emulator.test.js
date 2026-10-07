'use strict';
const admin = require('firebase-admin');
const register = require('./media-auto-tags.contract.cjs');
if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator required; never run this against production.');
const app = admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-moyeora' }, 'auto-tags-contract');
register(() => app.firestore());
