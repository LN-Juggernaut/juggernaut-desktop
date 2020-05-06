const runMigrations = db => {
  db.version(1).stores({
    wallets: '++id',
    conversations: '++id,pubkey,walletId,&[pubkey+walletId],[alias+walletId]',
    messages: '++id,conversationId,createdAt,&[preimage+conversationId]'
  });

  // introduced concept of valid messages (match Juggernaut protocol)
  // all messages before this version should be considered valid
  db.version(2)
    .stores({})
    .upgrade(tx => {
      return tx
        .table('messages')
        .toCollection()
        .modify(message => {
          message.valid = true;
        });
    });
};

export default runMigrations;
