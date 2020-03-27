const runMigrations = db => {
  db.version(1).stores({
    wallets: '++id',
    conversations: '++id,pubkey,walletId,&[pubkey+walletId],[alias+walletId]',
    messages: '++id,conversationId,createdAt,&[preimage+conversationId]'
  });
};

export default runMigrations;
