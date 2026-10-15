// Measure each worker's JS heap separately; the page's heap excludes compilers
// running in workers. Uses public Chrome DevTools Protocol methods.
export async function workerMemory(browser, pageSession) {
  const inspector = await browser.newBrowserCDPSession();
  try {
    const { targetInfo: pageTarget } = await pageSession.send('Target.getTargetInfo');
    const { targetInfos } = await inspector.send('Target.getTargets');
    const workers = targetInfos.filter(target => target.type === 'worker' && target.browserContextId === pageTarget.browserContextId);
    let usedBytes = 0;
    for (const target of workers) {
      const { sessionId } = await inspector.send('Target.attachToTarget', { targetId: target.targetId });
      try {
        const response = new Promise((resolve, reject) => {
          const onMessage = event => {
            if (event.sessionId !== sessionId) return;
            const message = JSON.parse(event.message);
            if (message.id !== 1) return;
            clearTimeout(timeout);
            inspector.off('Target.receivedMessageFromTarget', onMessage);
            if (message.error) reject(new Error(message.error.message));
            else resolve(message.result);
          };
          const timeout = setTimeout(() => {
            inspector.off('Target.receivedMessageFromTarget', onMessage);
            reject(new Error('Worker heap measurement timed out'));
          }, 3000);
          inspector.on('Target.receivedMessageFromTarget', onMessage);
        });
        await inspector.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id: 1, method: 'Runtime.getHeapUsage' }) });
        usedBytes += (await response).usedSize;
      } finally {
        await inspector.send('Target.detachFromTarget', { sessionId });
      }
    }
    return { workerCount: workers.length, workerHeapMB: Math.round(usedBytes / 1024 / 1024 * 10) / 10 };
  } finally {
    await inspector.detach();
  }
}
