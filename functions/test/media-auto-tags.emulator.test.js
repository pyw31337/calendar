'use strict';
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const register = require('./media-auto-tags.contract.cjs');
if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator required; never run this against production.');
const app = initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-moyeora' }, 'auto-tags-contract');
register(() => getFirestore(app));
