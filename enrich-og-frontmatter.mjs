import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import ogs from 'open-graph-scraper';
import picomatch from 'picomatch';
import { glob } from 'glob';

const AnthologiesFiles = {
    pattern: '**/*.{md,mdx}',
    base: 'src/content/anthologies'
};

const Ok = (value) => ({ ok: true, value });
const Err = (error) => ({ ok: false, error });

const logger = console;

const RequiredKeys = ['title', 'author', 'description', 'pubDate', 'originUrl'];


const hasAllPropsSet = (obj, required = RequiredKeys) =>
    Array.from(new Set([...required, ...Object.keys(obj)]))
        .every(key => key in obj && Boolean(obj[key]));


const ErrWithMsg = (logger) => (message) => (error) => {
    logger.warn(message);
    return Err(error);
};


const mapOgData = (ogResult) => ({
    ...Object.fromEntries(
        Object.entries(ogResult).filter(
            ([k]) => !['ogTitle', 'ogDescription', 'ogImage', 'ogAuthor'].includes(k)
        )
    ),
    title: ogResult.ogTitle ?? '',
    description: ogResult.ogDescription ?? '',
    image: ogResult.ogImage?.[0]?.url ?? '',
    author: ogResult.ogAuthor ?? '',
});


const fetchOpenGraph = (url, logger) =>
    ogs({ url })
        .then((res) => res.error ? Err(res.error) : Ok(res.result))
        .catch((error) =>
            ErrWithMsg(logger)(`Could not scrape ${url}: ${error.message}`)(error)
        );


const needsEnrichment = (data, filePath, defaults = RequiredKeys, logger = console) =>
    hasAllPropsSet(data, defaults)
        ? (logger.info(`Skip enriching: ${filePath}`), false)
        : (logger.info(`Needs enriched: ${filePath}`), true);


const readFrontmatterFile = (fs, matter) => async (filePath) =>
    ({ filePath, ...matter((await fs.readFile(filePath, 'utf-8'))) });


const writeFrontmatterFile = (fs, matter) => async (frontMatterFile) =>
    await fs.writeFile(frontMatterFile.filePath,
        matter.stringify(frontMatterFile.content, frontMatterFile.data), 'utf-8');


const removeEmptyValues = (obj) =>
    obj && typeof obj === 'object' && !Array.isArray(obj)
        ? Object.fromEntries(Object.entries(obj).filter(([, v]) => Boolean(v)))
        : obj;


const enrichFrontmatter = (logger) => async (frontMatterFile) => {

    const { data, filePath } = frontMatterFile;
    if (!needsEnrichment(data, filePath, RequiredKeys, logger)) return frontMatterFile;

    const result = await fetchOpenGraph(data.originUrl, logger);
    if (!result.ok || !result.value) return frontMatterFile;

    return {
        ...frontMatterFile,
        data: {
            ...mapOgData(result.value),
            ...removeEmptyValues(data),
            pubDate: new Date(),
        },
    };
}

const processFileList = async (fileList) => {
    logger.info(`Processing ${fileList.length} files:`);
    fileList.forEach(f => logger.info(`- ${f}`));

    const read = readFrontmatterFile(fs, matter);
    const toProcess = fileList.map(read);

    return Promise.all(toProcess)
        .then(frontmatters => Promise.all(frontmatters.map(enrichFrontmatter(logger))))
        .then(enriched => Promise.all(enriched.map(writeFrontmatterFile(fs, matter))));
};

async function main(pattern = process.argv[2]) {
    const mdFileMatcher = picomatch('**/*.{md,mdx}');

    const getFileList = () =>
        pattern
            ? glob(pattern, { nodir: true })
            : fs.readdir(AnthologiesFiles.base)
                .then(files => files.map(f => path.join(AnthologiesFiles.base, f)));

    const fileList = await getFileList().then(files => files.filter(mdFileMatcher));

    return fileList.length > 0
        ? processFileList(fileList)
        : logger.info('No files found to process.');
}

main().catch(logger.error);
