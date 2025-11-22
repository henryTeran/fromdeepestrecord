(async () => {
  try {
    await import('./functions/lib/index.js');
    console.log('Loaded module successfully');
  } catch (e) {
    console.error('Module load failed:', e);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
  }
})();
