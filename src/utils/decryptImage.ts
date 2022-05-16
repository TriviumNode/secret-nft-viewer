import axios from 'axios'
import retry from 'async-await-retry'
import crypto from 'crypto'

const ALGORITHM = "aes-256-gcm";

const download = async (url: string) => {
    return axios.get(url, {
      responseType: 'arraybuffer'
    })
}

const decrypt = (input: ArrayBuffer, key: string) => {
    const dataBuffer = Buffer.from(input)
    const data32 = dataBuffer.toString('utf-8').substring(0, 32);
    const cipherKey = Buffer.from(key);
    const ivSize = dataBuffer.readUInt8(0);
    const iv = dataBuffer.slice(1, ivSize + 1);
    const authTag = dataBuffer.slice(ivSize + 1, ivSize + 17);
    const decipher = crypto.createDecipheriv(ALGORITHM, cipherKey, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(dataBuffer.slice(ivSize + 17)),
      decipher.final(),
    ]);
};

const decryptImage = async (url: string, key: string) => {
    try {

        const data = await retry(
          async() => {
            const { data } = await download(url);
            return data;
          },
          undefined,
          {
            retriesMax: 5,
            interval: 1000
          },
        );
        
        const decrypted = decrypt(data, key);
        return decrypted;

    } catch (error) {
      throw error;
    }
};

export default decryptImage