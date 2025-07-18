import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudo',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Load sudo list
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Check OWNER or SUDO permission
    if (sender !== config.OWNER_NUMBER && !sudoList.includes(sender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner or Sudo only.*' });
    }

    // Get number from reply or args
    let numberToAdd = null;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      // If message reply with mentions, take first mentioned
      numberToAdd = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      // If reply to a message, get participant
      numberToAdd = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    }

    // If no number from reply, try from args
    if (!numberToAdd && args.length > 0) {
      numberToAdd = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToAdd) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* Reply to a message or type !sudoadd 123456789' });
    }

    if (sudoList.includes(numberToAdd)) {
      return sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToAdd} is already a sudo user.*` });
    }

    sudoList.push(numberToAdd);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToAdd} added as sudo.*` });
  }
};
