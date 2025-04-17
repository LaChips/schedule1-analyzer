// @ts-ignore
import { unzipSync } from 'https://cdn.skypack.dev/fflate';

const getArchiveContent = async (archive: File): Promise<{name: string, content: string}[]> => {
    const arrayBuffer = await archive.arrayBuffer();

    // Unzip the archive
    const unzipped = unzipSync(new Uint8Array(arrayBuffer));
    // Convert to File[]
    const fileArray = Object.keys(unzipped).map((key) => {
        const file = unzipped[key];
        const fileContent = new TextDecoder('utf-8').decode(file);
        return {
            name: key,
            content: fileContent,
        }
    });
    return fileArray;
}

export default getArchiveContent;