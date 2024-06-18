import * as IPFS from 'ipfs-core';

let node;

async function createNode() {
  if (!node) {
    node = await IPFS.create();
  }
}

export async function uploadToIPFS(data) {
  await createNode();
  const { cid } = await node.add(data);
  return cid.toString();
}

export async function getFromIPFS(cid) {
  await createNode();
  const decoder = new TextDecoder();
  let content = '';

  for await (const chunk of node.cat(cid)) {
    content += decoder.decode(chunk, { stream: true });
  }

  return content;
}
